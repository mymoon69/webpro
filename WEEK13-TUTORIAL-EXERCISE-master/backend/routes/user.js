const express = require("express");
const pool = require("../config");
const Joi = require('joi');
const bcrypt = require('bcrypt')

router = express.Router();

const passwordValidator = (value, helpers) => { //custom validator
    if (value.length < 8) {
        throw new Joi.ValidationError('Password must contain at least 8 characters')
    }
    if (!(value.match(/[a-z]/) && value.match(/[A-Z]/) && value.match(/[0-9]/))) {
        throw new Joi.ValidationError('Password must be harder')
    }
    return value
}

const usernameValidator = async (value, helpers) => {
    const [rows, _] = await pool.query(
        "SELECT username FROM users WHERE username = ?",
        [value]
    )
    if (rows.length > 0) {
        const message = 'This user is already taken'
        throw new Joi.ValidationError(message, { message })
    }
    return value
}

const signupSchema = Joi.object({
    email: Joi.string().email().required().max(100), // ต้องกรอก และ เป็น email ที่ถูกต้อง,
    mobile: Joi.string().required().pattern(/0[0-9]{9}/),
    first_name: Joi.string().required().max(150),// ต้องกรอก ไม่เกิน 150 ตัวอักษร
    last_name: Joi.string().required().max(150),// ต้องกรอก ไม่เกิน 150 ตัวอักษร
    password: Joi.string().required().custom(passwordValidator),
    confirm_password: Joi.string().required().equal(Joi.ref('password')), // ต้องเหมือนกับ password
    username: Joi.string().required().min(5).external(usernameValidator), //ถ้าติดต่อฐานข้อมูลต้องใช้ external
}) //instan ของ obj joi

router.post('/user/signup', async (req, res, next) => {
    try {
        await signupSchema.validateAsync(req.body, { abortEarly: false })
        //abortEarly เป็น option ถ้าfalse คือเช็คทุกตัวก่อนแล้วถ้าเจอปัญหาค่อยรีเทิร์นกลับไป
    } catch (err) {
        return res.status(400).json(err)
    }

    const conn = await pool.getConnection()
    await conn.beginTransaction()

    const username = req.body.username
    const password = await bcrypt.hash(req.body.password, 5)
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const email = req.body.email
    const mobile = req.body.mobile

    try {
        await conn.query(
            'INSERT INTO users(username, password, first_name, last_name, email, mobile) ' +
            'VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, first_name, last_name, email, mobile]// เติมเอง
        )
        conn.commit()
        res.status(201).send()
    } catch (err) {
        conn.rollback()
        res.status(400).json(err.toString());
    } finally {
        conn.release()
    }
})

exports.router = router