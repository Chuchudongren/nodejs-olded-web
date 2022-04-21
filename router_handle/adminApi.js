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
    console.log(username + '+' + password);
    const selectSql = `select * from admin where username =  ?`
    const selectSql1 = `select * from admin where username = ? and password = ?`
    db.query(selectSql, [username], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            if (results[0].state === 1) res.cc('账户已被禁用！')
            else db.query(selectSql1, [username, password], (err1, results1) => {
                if (err1) return res.cc(err1)
                if (results1.length > 0) {
                    let token = {
                        username,
                        roleid: results1[0].roleid,
                        token: jwt.sign({ username: username }, jwtSecretKey, { expiresIn })
                    }
                    res.send({
                        status: 200,
                        message: '登录成功！',
                        token
                    })
                } else res.cc('密码不正确！', 401)
            })

        } else res.cc('用户名不存在！', 401)
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
exports.getNewsList = (req, res) => {
    const selectSql = `select a.newsid,a.title,a.categoryid,b.categoryname,a.ishot from news a
    left join newscategory b on a.categoryid = b.categoryid`
    db.query(selectSql, (err, results) => {
        if (err) res.cc(err)
        if (results.length > 0) {
            res.send({
                status: 200,
                results
            })
        }
    })
}
exports.deleteNewsByid = (req, res) => {
    console.log('1');
    const newsid = req.body.newsid
    const deleteSql = `delete from news where newsid = ?`
    console.log(newsid);
    db.query(deleteSql, [newsid], (err, result) => {
        // if (err) res.cc(err)
        if (err) console.log(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
        else res.cc('删除失败！', 401)
    })
}
exports.setHotNews = (req, res) => {
    const newsid = req.body.newsid
    const ishot = req.body.ishot === '1' ? 1 : 0
    const updateSql = `update news set ishot = ? where newsid = ?`
    db.query(updateSql, [ishot, newsid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc(ishot === 1 ? '添加热门成功！' : '取消热门成功！', 200)
        else res.cc('修改失败！', 401)
    })
}
exports.getCategory = (req, res) => {
    const selectSql = `select * from newscategory`
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
exports.addNews = (req, res) => {
    const newsid = req.body.newsid ? req.body.newsid : -1
    const categoryid = req.body.categoryId
    const title = req.body.title
    const pic = req.body.pic
    const summary = req.body.summary
    const content = req.body.content
    const source = req.body.source
    const pushtime = new Date()
    const selectSql = `select title from news where newsid = ?`
    const insertSql = `insert into news (categoryid, title, pic, summary, content, source, pushtime) values (?,?,?,?,?,?,?)`
    const updateSql = `update news set categoryid = ?, title = ?, pic = ?, summary = ?, content=?,source=?, pushtime = ? where newsid = ?`
    db.query(selectSql, [newsid], (err1, results1) => {
        if (err1) return res.cc(err1)
        if (results1.length > 0) {
            db.query(updateSql, [categoryid, title, pic, summary, content, source, pushtime, newsid], (err2, result2) => {
                if (err2) return res.cc(err2)
                if (result2.affectedRows === 1) res.cc('更新成功', 200)
            })
        } else {
            db.query(insertSql, [categoryid, title, pic, summary, content, source, pushtime], (err2, result2) => {
                if (err2) return res.cc(err2)
                if (result2.affectedRows === 1) res.cc('发布成功', 200)
            })
        }
    })

}
exports.getNewsById = (req, res) => {
    const newsid = req.body.newsid
    const selectSql = `select * from news where newsid =? `
    db.query(selectSql, [newsid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            res.send({
                status: 200,
                results: results[0]
            })
        }
    })
}