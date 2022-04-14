// 创建 数据库的连接对象

// 导入 mysql 模块

const mysql = require('mysql')

// 创建数据库连接对象
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'guojie',
  database: 'olded',
})

// 向外 共享 db 数据库连接对象
module.exports = db
