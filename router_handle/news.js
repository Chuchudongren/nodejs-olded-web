/*
    在这里定义和新闻相关的路由处理函数，供 /router/news.js 模块进行调用
*/
const async = require('async');
// 导入 数据库 操作模块
const db = require('../db/index')
const clearData = (str) => {
    str.map(item => {
        let time = new Date(item.pushtime)
        let y = time.getFullYear()
        let M = time.getMonth() + 1
        M = M > 9 ? M : '0' + M
        let d = time.getDate()
        let h = time.getHours()
        h = h > 9 ? h : '0' + h
        let m = time.getMinutes()
        m = m > 9 ? m : '0' + m
        item.pushtime = `${y}-${M}-${d} ${h}:${m}`
    })
    return str
}
exports.newsIndex = (req, res) => {
    const categoryid = req.body.categoryid
    const selectSql = `select newsid,title,summary,pic from news where categoryid = ? and ishot = 1`
    db.query(selectSql, [categoryid], (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: 200,
            msg: '查询成功',
            results,
        })
    })
}
exports.newslist = (req, res) => {
    const categoryid = req.body.categoryid
    const userid = req.body.userid
    const selectSql = `select a.newsid,a.title,a.pic,a.summary,a.source,a.great,a.collect,a.pushtime, b.isGreat ,b.isCollect   from news a left join (select objectid ,great as isGreat,collect as isCollect from user_behavior where cateid = 1 and userid = ?)  b on (a.newsid = b.objectid) where a.categoryid = ?`
    db.query(selectSql, [userid, categoryid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let Newsresults = clearData(results)
            return res.send({
                status: 200,
                msg: '成功',
                result: Newsresults,
            })
        }
        res.cc('查询失败', 401)
    })

}
exports.newsdetail = (req, res) => {
    const newsid = req.body.newsid
    const userid = req.body.userid
    const selectBSql = `select * from user_behavior where userid = ? and objectid = ? and cateid = 1`
    const selectSql1 = `select * from news where newsid = ?`
    const selectSql2 = `select a.newsid,a.title,a.content,a.comment,a.source,a.great,a.collect,a.pushtime,b.great as isGreat,b.collect as isCollect from news a join user_behavior b on a.newsid = b.objectid where a.newsid = ? and b.userid = ? and cateid = 1 `
    db.query(selectBSql, [userid, newsid], (err, results1) => {
        if (err) return res.cc(err)
        if (results1.length === 1) {
            db.query(selectSql2, [newsid, userid], (err, results2) => {
                if (err) return res.cc(err)
                let Newsresults = clearData(results2)
                return res.send({
                    status: 200,
                    msg: '成功',
                    result: Newsresults[0],
                })
            })
        } else {
            db.query(selectSql1, [newsid], (err, results) => {
                if (err) return res.cc(err)
                if (results.length > 0) {
                    let Newsresults = clearData(results)
                    return res.send({
                        status: 200,
                        msg: '成功',
                        result: Newsresults[0],
                    })
                }
            })
        }
    })

}

exports.newssearch = (req, res) => {
    let searchkey = '%' + req.body.searchkey + '%'
    const userid = req.body.userid
    const selectSql = `select a.newsid,a.title,a.pic,a.summary,a.source,a.great,a.collect,a.pushtime, b.isGreat ,b.isCollect  from (select * from news where title like ? or summary like ? or content like ?) a left join (select objectid ,great as isGreat,collect as isCollect from user_behavior where cateid = 1 and userid = ?)  b on (a.newsid = b.objectid)`
    db.query(selectSql, [searchkey, searchkey, searchkey, userid], (err, results) => {
        if (err) return res.cc(err)
        let Newsresults = clearData(results)
        if (results.length > 0) {
            return res.send({
                status: 200,
                msg: '成功',
                results: Newsresults,
            })
        } else {
            return res.send({
                status: 300,
                msg: '搜索内容为空',
                results: [],
            })
        }
    })
}

exports.newsLike = (req, res) => {
    const objectid = req.body.newsid
    const value = req.body.value
    const userid = req.body.userid
    const updateSql = `UPDATE news SET great = great + ? WHERE (newsid = ?);`
    const selectSql = `select * from user_behavior where userid = ? and objectid = ? and cateid = 1`
    const insertSql = `insert into user_behavior (userid,objectid,cateid,great) values (?,?,1,?)`
    const updateBehaviorSql = `update user_behavior set great = ? where objectid = ? and userid = ?`
    db.query(updateSql, [value, objectid], (err, results) => {
        if (err) return res.cc(err)
    })
    db.query(selectSql, [userid, objectid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length !== 1) {
            db.query(insertSql, [userid, objectid, value])
        } else {
            db.query(updateBehaviorSql, [value, objectid, userid])
        }
        return res.send({
            status: 200,
            msg: '操作成功'
        })
    })

}
exports.newsCollect = (req, res) => {
    const objectid = req.body.newsid
    const value = req.body.value
    const userid = req.body.userid
    const updateSql = `UPDATE news SET collect = collect + ? WHERE (newsid = ?);`
    const selectSql = `select * from user_behavior where userid = ? and objectid = ? and cateid = 1`
    const insertSql = `insert into user_behavior (userid,objectid,cateid,collect) values (?,?,1,?)`
    const updateBehaviorSql = `update user_behavior set collect = ? where objectid = ? and userid = ?`
    db.query(updateSql, [value, objectid], (err, results) => {
        if (err) return res.cc(err)
    })
    db.query(selectSql, [userid, objectid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length !== 1) {
            db.query(insertSql, [userid, objectid, value])
        } else {
            db.query(updateBehaviorSql, [value, objectid, userid])
        }
        return res.send({
            status: 200,
            msg: '操作成功'
        })
    })

}
