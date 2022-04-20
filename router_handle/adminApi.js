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

exports.user = (req, res) => {
    const selectSql = `select a.adminid,a.username,a.password,a.roleid,b.rolename,a.state 
    from admin a
    left join roles b
    on a.roleid = b.roleid`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            res.send({
                status: 200,
                results
            })
        }
    })
}
exports.changeRoleById = (req, res) => {
    const adminid = req.body.adminid
    const rolename = req.body.rolename
    const password = req.body.password
    const username = req.body.username
    const updateSql = `update admin set roleid = (select roleid from roles where rolename = ?),username = ?,password = ? where adminid = ?`
    db.query(updateSql, [rolename, username, password, adminid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('修改成功！', 200)
        } else {
            res.cc('修改失败！', 200)
        }
    })
}
exports.disabledUser = (req, res) => {
    const adminid = req.body.adminid
    const state = req.body.state === 0 ? 1 : 0
    const updateSql = `update admin set state = ? where adminid = ?`
    db.query(updateSql, [state, adminid])
}
exports.addAdmin = (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const rolename = req.body.rolename
    const insertSql = `insert into admin (username,password,roleid) values (?,?,(select roleid from roles where rolename = ?))`
    const selectSql = `select * from admin where adminid = ?`
    db.query(insertSql, [username, password, rolename], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            db.query(selectSql, [result.insertId], (err1, result1) => {
                if (err1) return res.cc(err1)
                res.send({
                    status: 200,
                    message: '添加成功！',
                    newData: result1[0]
                })
            })

        } else res.cc('添加失败', 200)
    })
}