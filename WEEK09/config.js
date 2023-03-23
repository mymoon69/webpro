const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost', //ที่อยู่ของ database server
  user: 'root',
  password: 'peeranut',
  database: 'webpro',
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0
});

module.exports = pool;