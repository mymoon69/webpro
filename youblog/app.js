
const express = require('express')

const app = express()

const path = require('path')

// Setup ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));//เก็บไฟล์htmlไว้ที่views

// Setup static path
app.use(express.static(path.join(__dirname, 'public')))

// Config Router
const indexRouter = require('./routes/index')
const blogRouter = require('./routes/blog')

app.use('/', indexRouter)
app.use('/blog', blogRouter)





// ดึงข้อมูล json มาเก็บไว้ในตัวแปร
// const article = require('./article-db')

// กำหนดให้ path blogapi แสดงข้อมูลบทความทั้งหมดในรูปแบบ json

// app.get('/blogapi', (req, res) => {
//     console.log(req.query)
//     res.json(article)
//   })
  
  // กำหนดให้ path blogapi/id แสดงข้อมูลบทความตาม id ที่กำหนด
  
//   app.get('/blogapi/:id/:name', (req, res) => {
//     console.log(req.params)
//     res.json(article.find(article => article.id === req.params.id))
//   })

app.listen(3000, () => {
  console.log('Start server at port 3000.')
})
