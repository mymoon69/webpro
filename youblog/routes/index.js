const express = require('express')
const router = express.Router()

// ดึงข้อมูล json มาเก็บไว้ในตัวแปร
const article = require('../article-db')

router.get('/', function(req, res, next) {
    var data = { 
        article: article } //เอาข้อมูลใน json ใส่
    res.render('index', data)//render html index ชื่อไฟล์
})

module.exports = router