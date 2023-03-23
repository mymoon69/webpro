const express = require("express")

const path = require("path")

const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs')
// set root folder for views
app.set('views', path.join(__dirname, 'views'))

// Statics
app.use(express.static(path.join(__dirname, 'static')))

const indexRouter = require('./routes/blog') // clip

app.use('/', indexRouter)

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`)
})