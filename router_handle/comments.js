/*
    在这里定义和评论相关的路由处理函数，供 /router/comments.js 模块进行调用
*/

// 导入 数据库 操作模块
const db = require('../db/index')

exports.selectNewsComments = (req, res) => {
    const newsid = req.body.newsid
    const selectSql = `select a.commentid,a.userid,a.content,b.nickname,b.avatar  from usercomment a join userinfo b on a.userid = b.userid where a.objectid = ? and a.cateid = 1`
    db.query(selectSql, [newsid], (err, result) => {
        if (err) return res.cc(err)
        if (result.length > 0) {
            return res.send({
                status: 200,
                msg: '成功',
                result: result,
            })
        }
        res.cc('查询失败', 401)
    })

}

exports.newsAddComment = (req, res) => {
    const newsid = req.body.newsid
    const userid = req.body.userid
    const content = req.body.content
    const insertSql = `insert into usercomment (objectid,userid,content,cateid) values (?,?,?,1)`
    const addComments = `update news set comment = comment+ 1 where newsid = ?`
    db.query(insertSql, [newsid, userid, content], (err, result) => {
        db.query(addComments, [newsid])
        if (err) return res.cc(err)
        res.send({
            status: 200,
            commentid: result.insertId
        })
    })
}