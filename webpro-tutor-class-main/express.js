const express = require('express');
const app = express();
const Joi = require('joi');

const pool = require('./config/database');
const { cache } = require('joi');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** 
 *  เริ่มทำข้อสอบได้ที่ใต้ข้อความนี้เลยครับ
 * !!! ไม่ต้องใส่ app.listen() ในไฟล์นี้นะครับ มันจะไป listen ที่ไฟล์ server.js เองครับ !!!
 * !!! ห้ามลบ module.exports = app; ออกนะครับ  ไม่งั้นระบบตรวจไม่ได้ครับ !!!
*/
app.get('/get_todo', async function(req, res, next){
    const [data] = await pool.query('select * from todo')
    return res.send(data) //res.send send one time so push return
})

app.delete('/todo/:id/', async function(req, res, next){
    const id = req.params.id
    
    const [todo] = await pool.query('select * from todo where id = ?', [id])

    if(todo.length == 0){
        return res.status(404).send(({
            "message": "ไม่พบ ToDo ที่ต้องการลบ"
          }))
    }

    const conn = await pool.getConnection()
    await conn.beginTransaction()
    
    try {
        const [data] = await pool.query('delete from todo where id = ?', [id])

        await conn.commit()

        res.send({
            "message": `ลบ ToDo '${todo[0].title}' สำเร็จ`,
        })

    }catch (error) {
        await conn.rollback()
        res.status(400)

    }finally {
        conn.release()
    }
})

const checkDate = Joi.object({
    start_date: Joi.date().required(),
    end_date: Joi.date().min(Joi.ref('start_date')).required() 
})

app.get('/todo/', async function(req, res, next){

    const result = checkDate.validate(req.query)
    if(result.error){
        console.log(result.error.details)
        return res.status(400).send(result.error.details)
    }

   

    // try {
    //     await checkDate.validateAsync(req.query, { abortEarly: false })
    //     //abortEarly เป็น option ถ้าfalse คือเช็คทุกตัวก่อนแล้วถ้าเจอปัญหาค่อยรีเทิร์นกลับไป
    //   } catch (err) {
    //     console.log(err)
    //     return res.status(400).json(err)
  
    // }

    const start_date = req.query.start_date
    const end_date = req.query.end_date

    const [data] = await pool.query('select *, DATE_FORMAT(due_date, "%Y-%m-%d") AS due_date from todo where due_date between ? and ?', [start_date, end_date])
    // console.log(data)

    return res.status(200).send(data)
   
})

 //key ลัด
 const num = [[1,2,3,4],[1,2,3],[1,2,4]]
 const {m1, m2} = prin

 app.get('/mac', async function(req,res){
    let array = []
    let nulval = null

    if(!nulval){
        res.send("nulVar is null")
    }

    if(array.length == 0){
        res.send("array is null")
    }
 })

module.exports = app;
