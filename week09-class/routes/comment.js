const express = require("express");
const pool = require("../config");
const router = express.Router();

// Get comment
router.get('/:blogId/comments', function (req, res, next) {
});

// Create new comment
router.post('/:blogId/comments', async function (req, res, next) {
    try {
        // const [rows, fields] = await pool.query("SELECT * FROM comments");
        const [rows1, fields1] = await pool.query("INSERT INTO comments (comment, comments.like, blog_id, comment_by_id) VALUES (?, ?, ?, ?)", [
            req.body.comment, req.body.like, req.params.blogId, req.body.comment_by_id
        ]); //return เป็น promise ต้องมีการรอผลเพราะมี await
        //res กลับเป็น
        res.json({ message: `A new comment is added (ID: ${rows1.insertId})` })
        // console.log("row1", rows1)
        console.log(req.body)
    } catch (err) {
        return next(err);
    }
    // return
});

// Update comment
router.put('/comments/:commentId', async function (req, res, next) {
    try {
        const [rows, fields] = await pool.query("SELECT * FROM comments WHERE id=?", [req.params.commentId]);
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
        const [rows, fields] = await pool.query("SELECT * FROM comments WHERE id = ?", [req.params.commentId]);
        const [rows1, fields1] = await pool.query("DELETE FROM comments WHERE id = ?", [req.params.commentId]); //return เป็น promise ต้องมีการรอผลเพราะมี await
        //res กลับเป็น
        res.json(
            { message: `Comment ID ${req.params.commentId} is deleted.` }
        )
    } catch (err) {
        return next(err);
    }
});

// Add like
router.put('/comments/addlike/:commentId', async function (req, res, next) {
    try {
        const [rows, fields] = await pool.query("SELECT * FROM comments WHERE id=?", [req.params.commentId,]); //return เป็น promise ต้องมีการรอผลเพราะมี await
        let likeNum = rows[0].like //เก็บค่าเดิม
        console.log('Like num =', likeNum) // console.log() จำนวน Like ออกมาดู
        //เพิ่มจำนวน like ไปอีก 1 ครั้ง
        console.log(rows[0])
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