const express = require("express");
const pool = require("../config");
const path = require("path")

const router = express.Router();

//require multer for file upload
const multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './static/uploads') // path to save file //บอกว่าไปอยู่ตรงไหน
    },
    filename: function (req, file, callback) {
        // set file name
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    } //ตั้งชื่อไฟล์
})

const upload = multer({ storage: storage })

// Get comment
router.get('/:blogId/comments', function (req, res, next) {
});

// Create new comment
router.post('/:blogId/comments', upload.single('myImage'), async function (req, res, next) {
    const file = req.file;

    const comment = req.body.comment;

    const conn = await pool.getConnection() //create connection
    await conn.beginTransaction(); //begin transaction

    try {
        let results = await conn.query(
            "INSERT INTO comments(blog_id, comment) VALUES(?, ?);",
            [req.params.blogId, comment]
        );
        const commentId = results[0].insertId;

        if (file) {
            await conn.query(
                "INSERT INTO images(blog_id, comment_id, file_path) VALUES(?, ?, ?);",
                [req.params.blogId, commentId, file.path.substr(6)])
        }

        await conn.commit()
        // res.send("success!");
        res.redirect('/blogs/' + req.params.blogId);
    } catch (err) {
        await conn.rollback(); //ย้อนสถานะกลับไป
        next(err);
    } finally {
        console.log('finally')
        conn.release(); //บอกว่าปิดคอนเนคชั่น
    }
});

// Update comment
router.put('/comments/:commentId', async function (req, res, next) {
    try {
        // const [rows, fields] = await pool.query("SELECT * FROM comments WHERE id=?", [req.params.commentId]);
        const [rows1, fields1] = await pool.query("UPDATE comments SET comment = ?, comments.like = ?, comment_date = ?, comment_by_id = ?, blog_id = ? WHERE id=?", [
            req.body.comment, req.body.like, req.body.comment_date, req.body.comment_by_id, req.body.blog_id, req.params.commentId
        ]); //return เป็น promise ต้องมีการรอผลเพราะมี await
        //res กลับเป็น
        res.json(
            {
                message: `Comment ID ${req.params.commentId} is updated.`,
                comment: req.body
            }
        )
        console.log(req.body)
    } catch (err) {
        return next(err);
    }
});

// Delete comment
router.delete('/comments/:commentId', async function (req, res, next) {
    try {
        const [rows, fields] = await pool.query("SELECT * FROM comments WHERE id = ?", [req.params.commentId]); //เก็บตัวที่จะลบ
        const [rows1, fields1] = await pool.query("DELETE FROM comments WHERE id = ?", [req.params.commentId]); //return เป็น promise ต้องมีการรอผลเพราะมี await
        //res กลับเป็น
        res.json(
            { message: `Comment ID ${req.params.commentId} is deleted.` }
        )
        console.log(rows)
        console.log(rows1)
    } catch (err) {
        return next(err);
    }
});

// Add like
router.put('/comments/addlike/:commentId', async function (req, res, next) {
    try {
        const [rows, fields] = await pool.query("SELECT * FROM comments WHERE id=?", [req.params.commentId,]); //return เป็น promise ต้องมีการรอผลเพราะมี await
        let likeNum = rows[0].like //เก็บค่าเดิม
        //เพิ่มจำนวน like ไปอีก 1 ครั้ง
        console.log(rows[0])//ข้อมูลเป็น arrayตัวที่ 0
        likeNum += 1

        //Update จำนวน Like กลับเข้าไปใน DB
        const [rows2, fields2] = await pool.query("UPDATE comments SET comments.like=? WHERE comments.id=?", [
            likeNum, req.params.commentId
        ]);

        // return json response
        return res.json({
          blogId: rows[0].blog_id,
          commentId: req.params.commentId,
          likeNum: likeNum
        })

        //Redirect ไปที่หน้า index เพื่อแสดงข้อมูล
    } catch (err) {
        return next(err);
    }
});


exports.router = router