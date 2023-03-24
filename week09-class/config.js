const mysql = require('mysql2/promise');
//เอาไว้ติดต่อกับฐานข้อมูล
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'webpro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;