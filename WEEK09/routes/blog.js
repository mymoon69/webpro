const express = require('express')
const router = express.Router()

const pool = require("../config");

router.get('/', async function (req, res, next) {
    const [rows, fields] = await pool.query('SELECT a.*, b.file_path FROM blogs AS a LEFT JOIN images AS b ON a.id=b.blog_id WHERE b.main=1') //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
    res.render('blogs/index', { data: JSON.stringify(rows) })
})

router.get('/insert', async function (req, res, next) {
    const [rows, fields] = await pool.query(
        'INSERT INTO blogs(title, content, status, pinned, blogs.like) VALUES(?,?,?,?,?)',
        ['New title!', 'My content bla bla bla', '01', 1, 10]
    ) //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
    console.log('rows', rows.insertId)

    const [rows2, fields2] = await pool.query('SELECT * FROM blogs') //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
    // console.log(rows)
    res.render('blogs/index', { blogs: rows2 })
})

// For blog detail page
router.get("/detail/:blogId", async function (req, res, next) {
    //   Your code here
    const [blogs, fields] = await pool.query(
        'SELECT * FROM blogs WHERE id=?', //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
        [req.params.blogId]
    )

    const [images, fields1] = await pool.query(
        'SELECT * FROM images WHERE blog_id=?', //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
        [req.params.blogId]
    )

    const [comments, fields2] = await pool.query(
        'SELECT * FROM comments WHERE blog_id=?', //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
        [req.params.blogId]
    )

    console.log(blogs)
    console.log(images)
    res.render('blogs/detail', {
        blog: JSON.stringify(blogs[0]),
        images: JSON.stringify(images),
        comments: JSON.stringify(comments),
    })
});

router.get('/update', async function (req, res, next) {
    const [rows, fields] = await pool.query(
        'UPDATE blogs SET blogs.like = ? WHERE id > 3',
        [10]
    ) //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
    console.log('rows', rows.affectedRows)
    console.log('rows', rows.changedRows)

    const [rows2, fields2] = await pool.query('SELECT * FROM blogs') //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
    // console.log(rows)
    res.render('blogs/index', { blogs: rows2 })
});

router.get('/delete/:id', async function (req, res, next) {
    const blogId = req.params.id
    const [rows, fields] = await pool.query(
        'DELETE FROM blogs WHERE id = ?',
        [blogId]
    ) //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
    console.log('rows', rows.affectedRows)
    console.log('rows', rows.changedRows)

    const [rows2, fields2] = await pool.query('SELECT * FROM blogs') //ประกาศตัวแปร เป็นอาเรย์ขนาดสอง
    // console.log(rows)
    res.render('blogs/index', { blogs: rows2 })
})

router.get("/create", async function (req, res, next) {
    res.render("blogs/create");
});

router.post("/create", upload.sringle('myImage'), async function (req, res, next) {
    console.log(req.nnody)
    const title = req.body.title
    const content = req.body.content
    const status = req.body.stutus
    const pinned = req.body.pinned ? 1 : 0

    const file = req.file

    const conn = await pool.getConnection()

    await conn.beginTransaction()

    try {
        const [blogs, columns1] = await conn.query(
            'INSERT INTO blogs(title, content, status, pinned, blogs.like, crete_date) VALUES(?, ?, ?, ?, 0, CURRENT_TIMESTAMP)',
            [title, content, status, pinned]
        )
        const [images, columns2] = await conn.query(
            'INSERT INTO images(blog_id, file_path, upload_date, main) VALUES(?, ?, CURRENT_TIMESTAMP, 1)',
            [blogs.insertId, file_path.substring(7)]
        )
        await conn.commit()
    }
    catch (err) {
        console.log(err)
        await conn.rollback
    } finally {
        console.log('finally')
        await conn.release()
    }
    res.redirect("/");
});

module.exports = router