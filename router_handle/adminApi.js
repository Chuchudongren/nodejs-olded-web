/*
    在这里定义和管理员相关的路由处理函数，供 /router/adminApi.js 模块进行调用
*/

const jwt = require('jsonwebtoken')
const { jwtSecretKey, expiresIn } = require('../config')
// 导入 数据库 操作模块
const db = require('../db/index')

exports.login = (req, res) => {
    const username = req.body.username
    const password = req.body.password
    res.send({
        status: 200,
        message: '登录成功！',
        token: jwt.sign({ username: username }, jwtSecretKey, { expiresIn })
    })
}
exports.user = (req, res) => {
    const username = req.body.username
    const password = req.body.password
    res.send({
        status: 200,
        message: '登录成功！',
        result: '123'
    })
}
function roleRight(results) {
    let newResults = results.filter(item => { return item.grade === 1 })
    newResults.map(res => {
        let children = results.filter(item => { return item.pid === res.rightid })
        if (children.length > 0) res.children = children
    })
    return newResults
}
exports.getRoleRights = (req, res) => {
    const roleid = req.body.roleid
    const selectSql = `SELECT b.rightid,b.title,b.href,b.grade,b.pid
    from rolerights a 
    left join rights b
    on a.rightid = b.rightid
    where a.roleid = ?`
    db.query(selectSql, [roleid], (err, results) => {
        if (err) return res.cc(err)
        let newResults = roleRight(results)
        if (results.length > 0) {
            res.send({
                status: 200,
                results: newResults
            })
        } else {
            res.cc('未找到数据！', 401)
        }
    })
}