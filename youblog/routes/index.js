const express = require('express')
const router = express.Router()

// ดึงข้อมูล json มาเก็บไว้ในตัวแปร
const article = require('../article-db')

router.get('/', function(req, res) {
    var data = {article : article}
    var search = req.query.search
    if(search == undefined){
        var data = { 
            article: article } //เอาข้อมูลใน json ใส่ //not filter
            res.render('index', data)//render html index ชื่อไฟล์
    }else{
        var data = { article: article.filter(value => {
            return value.title.toLowerCase().includes(search.toLowerCase())
        })}
        res.render('index', data)//render html index ชื่อไฟล์
    }
    console.log(data)
    console.log(search) //not search = underfined
})

module.exports = router