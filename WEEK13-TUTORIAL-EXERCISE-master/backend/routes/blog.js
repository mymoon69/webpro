const express = require("express");
const path = require("path");
const pool = require("../config");
const fs = require("fs");
const Joi = require('joi');

router = express.Router();

// Require multer for file upload
const multer = require("multer");
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./static/uploads");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Like blog that id = blogId
router.put("/blogs/addlike/:blogId", async function (req, res, next) {
  const conn = await pool.getConnection();
  // Begin transaction
  await conn.beginTransaction();

  try {
    let [
      rows,
      fields,
    ] = await conn.query("SELECT `like` FROM `blogs` WHERE `id` = ?", [
      req.params.blogId,
    ]);
    let like = rows[0].like + 1;

    await conn.query("UPDATE `blogs` SET `like` = ? WHERE `id` = ?", [
      like,
      req.params.blogId,
    ]);

    await conn.commit();
    res.json({ like: like });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json(err);
  } finally {
    console.log("finally");
    conn.release();
  }
});

const createSchema = Joi.object({
  title: Joi.string().required().pattern(/^[a-zA-Z]{10,25}$/),
  content: Joi.string().required().min(50),
  status: Joi.string().valid('status_private','status_public').required(),
  reference: Joi.string().uri(),
  pinned: Joi.string().required(),
  start_date: Joi.date().optional(),
  eend_date: Joi.date().optional().when('start_date', {
    is: Joi.date().required(),
    then: Joi.date().min(Joi.ref('start_date')).required(),
    otherwise: Joi.date().forbidden()
  })
}) //instan ของ obj joi

//create
router.post(
  "/blogs",
  upload.array("myImage", 5),
  async function (req, res, next) {

    try {
      console.log("kkk")
      await createSchema.validateAsync(req.body, { abortEarly: false })
      //abortEarly เป็น option ถ้าfalse คือเช็คทุกตัวก่อนแล้วถ้าเจอปัญหาค่อยรีเทิร์นกลับไป
    } catch (err) {
      console.log(err)
      return res.status(400).json(err)

    }

    if (req.method == "POST") {
      const file = req.files;
      let pathArray = [];

      if (!file) {
        console.log("file")
        return res.status(400).json({ message: "Please upload a file" });
      }

      const title = req.body.title;
      const content = req.body.content;
      const pinned = req.body.pinned;
      let status = req.body.status
      const reference = req.body.reference;
      const start_date = req.body.start_date;
      const end_date = req.body.end_date;

      if (status == "status_public") {
        status = 01
      }else if (status == "status_private") {
        status = 02
      }

      const conn = await pool.getConnection();
      // Begin transaction
      await conn.beginTransaction();

      

      console.log(status)

      try {
        console.log("asd")
        let results = await conn.query(
          "INSERT INTO blogs(title, content, status, pinned, `like`,create_date, reference, start_date, end_date) VALUES(?, ?, ?, ?, 0,CURRENT_TIMESTAMP, ?, ?, ?);",
          [title, content, status, '0', reference, start_date, end_date]
        );
        console.log("116")
        const blogId = results[0].insertId;
        console.log("117")
        req.files.forEach((file, index) => {
          let path = [blogId, file.path.substring(6), index == 0 ? 1 : 0];
          pathArray.push(path);
        });

        await conn.query(
          "INSERT INTO images(blog_id, file_path, main) VALUES ?;",
          [pathArray]
        );
        console.log("127")
        await conn.commit();
        res.send("success!");
      } catch (err) {
        console.log(err)
        await conn.rollback();
        console.log("rollback")
        return res.status(400).json(err);
      } finally {
        console.log("finally");
        conn.release();
      }
    }
  }
);

// Blog detail
router.get("/blogs/:id", function (req, res, next) {
  // Query data from 3 tables
  const promise1 = pool.query("SELECT * FROM blogs WHERE id=?", [
    req.params.id,
  ]);
  const promise2 = pool.query("SELECT * FROM comments WHERE blog_id=?", [
    req.params.id,
  ]);
  const promise3 = pool.query("SELECT * FROM images WHERE blog_id=?", [
    req.params.id,
  ]);

  // Use Promise.all() to make sure that all queries are successful
  Promise.all([promise1, promise2, promise3])
    .then((results) => {
      const [blogs, blogFields] = results[0];
      const [comments, commentFields] = results[1];
      const [images, imageFields] = results[2];
      res.json({
        blog: blogs[0],
        images: images,
        comments: comments,
        error: null,
      });
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
});

router.put("/blogs/:id", upload.array("myImage", 5), async function (req, res, next) {
  // Your code here
  const file = req.files;
  let pathArray = []

  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    next(error);
  }

  const title = req.body.title;
  const content = req.body.content;
  const status = req.body.status;
  const pinned = req.body.pinned;

  const conn = await pool.getConnection()
  await conn.beginTransaction();

  try {
    console.log(content)
    let results = await conn.query(
      "UPDATE blogs SET title=?, content=?, status=?, pinned=? WHERE id=?",
      [title, content, status, pinned, req.params.id]
    )

    if (file.length > 0) {
      file.forEach((file, index) => {
        let path = [req.params.id, file.path.substring(6), 0]
        pathArray.push(path)
      })

      await conn.query(
        "INSERT INTO images(blog_id, file_path, main) VALUES ?;",
        [pathArray])
    }

    await conn.commit()
    res.send("success!");
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    console.log('finally')
    conn.release();
  }
  return;
});

router.delete("/blogs/:blogId", async function (req, res, next) {
  // Your code here
  const conn = await pool.getConnection();
  // Begin transaction
  await conn.beginTransaction();

  try {
    // Check that there is no comments
    const [
      rows1,
      fields1,
    ] = await conn.query(
      "SELECT COUNT(*) FROM `comments` WHERE `blog_id` = ?",
      [req.params.blogId]
    );
    console.log(rows1);

    if (rows1[0]["COUNT(*)"] > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete blogs with comments" });
    }

    //Delete files from the upload folder
    const [
      images,
      imageFields,
    ] = await conn.query(
      "SELECT `file_path` FROM `images` WHERE `blog_id` = ?",
      [req.params.blogId]
    );
    const appDir = path.dirname(require.main.filename); // Get app root directory
    console.log(appDir)
    images.forEach((e) => {
      const p = path.join(appDir, 'static', e.file_path);
      fs.unlinkSync(p);
    });

    // Delete images
    await conn.query("DELETE FROM `images` WHERE `blog_id` = ?", [
      req.params.blogId,
    ]);
    // Delete the selected blog
    const [
      rows2,
      fields2,
    ] = await conn.query("DELETE FROM `blogs` WHERE `id` = ?", [
      req.params.blogId,
    ]);

    if (rows2.affectedRows === 1) {
      await conn.commit();
      res.status(204).send();
    } else {
      throw "Cannot delete the selected blog";
    }
  } catch (err) {
    console.log(err)
    await conn.rollback();
    return res.status(500).json(err);
  } finally {
    conn.release();
  }
});

exports.router = router;
