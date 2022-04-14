const db = require('../db/index')

const util = require('./util')


exports.getTopicListByCate = (req, res) => {
    const cateid = req.body.cateid
    const selectSql = `select a.topicid,a.userid,b.nickname,a.title,a.pushtime,a.hits,a.star,a.replytime,a.ishot from  topic a 
    left join userinfo b 
    on a.userid = b.userid 
    where modify = 0 and cateid = ?
    order by a.pushtime desc`
    db.query(selectSql, [cateid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newResults = util.clearDataTime(results, 'pushtime')
            res.send({
                status: 200,
                results: newResults
            })
        } else {
            res.cc('没有找到数据', 401)
        }
    })
}
exports.getTopicByid = (req, res) => {
    const topicid = req.body.topicid
    const selectSql = `select a.topicid,a.userid,b.nickname,a.content,a.title,a.pushtime,a.hits,a.star,a.replytime,a.ishot,a.cateid,c.hoardcate from  topic a 
    left join userinfo b on a.userid = b.userid 
    left join hoardcate c on a.cateid = c.hoardcateid
    where topicid = ?
    order by a.pushtime desc`
    db.query(selectSql, [topicid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newResults = util.clearDataTime(results, 'pushtime', 'replytime')
            res.send({
                status: 200,
                results: newResults[0]
            })
        } else {
            res.cc('没有找到数据', 401)
        }
    })
}
exports.getTopicFollowByid = (req, res) => {
    const topicid = req.body.topicid
    const selectSql = `select a.topicfollowid,a.topicid,a.userid,b.nickname,a.pushtime,a.content,a.isMain from  topicfollow a
    left join userinfo b 
    on a.userid = b.userid
    where modify = 0 and topicid = ?
    order by a.pushtime desc`
    db.query(selectSql, [topicid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newResults = util.clearDataTime(results, 'pushtime')
            res.send({
                status: 200,
                results: newResults
            })
        } else {
            res.cc('没有找到数据', 401)
        }
    })
}
exports.getTopicCommentByid = (req, res) => {
    const topicid = req.body.topicid
    const selectSql = `select a.topiccommentid,a.topicfollowid,a.userid,c.nickname,a.content,a.pushtime,a.parentid 
    from topiccomment a 
    right join  topicfollow b 
    on a.topicfollowid = b.topicfollowid 
    left join userinfo c
    on a.userid = c.userid
    where b.topicid = ? `
    db.query(selectSql, [topicid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newResults = util.clearDataTime(results, 'pushtime')
            res.send({
                status: 200,
                results: newResults
            })
        } else {
            res.cc('没有找到数据', 401)
        }
    })
}
exports.getHoardCate = (req, res) => {
    const selectSql = `select hoardcateid,hoardcate from hoardcate`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            res.send({
                status: 200,
                results
            })
        } else {
            res.cc('没找数据', 401)
        }
    })

}
exports.pushTopic = (req, res) => {
    const title = req.body.title
    const userid = req.body.userid
    const content = req.body.content
    const cateid = req.body.cateid
    const date = util.clearDataTimeUtil(new Date())
    const insertSql = `insert into topic (userid,title,content,pushtime,cateid) values (?,?,?,?,?)`
    db.query(insertSql, [userid, title, content, date, cateid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('添加成功', 200)
        } else {
            res.cc('添加失败', 401)
        }
    })
}
exports.isStar = (req, res) => {
    const userid = req.body.userid
    const objectid = req.body.objectid
    const cateid = req.body.cateid
    const selectSql = `select great from user_behavior where userid = ? and objectid = ? and cateid = ?`
    db.query(selectSql, [userid, objectid, cateid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            res.send({
                status: 200,
                isStar: results[0].great === 1 ? true : false
            })
        } else {
            res.cc('没找到数据', 401)
        }
    })
}
exports.setBehavior = (req, res) => {
    const userid = req.body.userid
    const objectid = req.body.objectid
    const cateid = req.body.cateid
    const behavior = req.body.behavior
    const add = req.body.add
    const selectSql = `select userid from user_behavior where userid = ? and objectid = ? and cateid = ?`
    const updateSql = `update user_behavior set  ${behavior} = ? where userid = ? and objectid = ? and cateid = ?`
    const insertSql = `insert into user_behavior (userid,objectid,cateid,${behavior}) values (?,?,?,?)`
    const updateSqltopic = `update topic set star = star + ? where topicid = ?`
    db.query(selectSql, [userid, objectid, cateid], (err1, result1) => {
        if (err1) return res.cc(err1)
        if (result1.length > 0) {
            db.query(updateSql, [add, userid, objectid, cateid], (err2, result2) => {
                if (err2) return res.cc(err2)
                if (result2.affectedRows === 1) {
                    // 点赞成功
                    db.query(updateSqltopic, [add, objectid], (err, result) => {
                        if (err) return res.cc(err)
                    })
                    return res.cc('点赞成功', 200)

                } else {
                    return res.cc('点赞失败', 401)
                }
            })
        } else {
            db.query(insertSql, [userid, objectid, cateid, add], (err3, result3) => {
                if (err3) return res.cc(err3)
                if (result3.affectedRows === 1) {
                    // 点赞成功
                    db.query(updateSqltopic, [add, objectid], (err, result) => {
                        if (err) return res.cc(err)
                    })
                    return res.cc('点赞成功', 200)
                } else {
                    return res.cc('点赞失败', 401)
                }
            })
        }
    })
}
exports.pushSonComment = (req, res) => {
    const userid = req.body.userid
    const parentid = req.body.parentid
    const value = req.body.value
    const topicfollowid = req.body.topicfollowid
    const date = new Date()
    const insertSql = `insert into topiccomment (userid, parentid, content,topicfollowid,pushtime) values(?,?,?,?,?)`
    db.query(insertSql, [userid, parentid, value, topicfollowid, date], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('提交成功', 200)
        } else {
            res.cc('提交失败', 401)
        }
    })
}
exports.pushComment = (req, res) => {
    const userid = req.body.userid
    const value = req.body.value
    const topicfollowid = req.body.topicfollowid
    const date = new Date()
    const insertSql = `insert into topiccomment (userid, content,topicfollowid,pushtime) values(?,?,?,?)`
    db.query(insertSql, [userid, value, topicfollowid, date], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('提交成功', 200)
        } else {
            res.cc('提交失败', 401)
        }
    })
}
exports.addHits = (req, res) => {
    const topicid = req.body.topicid
    const updateSql = `update topic set hits = hits + 1 where topicid = ?`
    db.query(updateSql, [topicid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('添加成功', 200)
        } else {
            res.cc('添加失败', 401)
        }
    })
}
exports.pushTopicFollow = (req, res) => {
    const userid = req.body.userid
    const topicid = req.body.topicid
    const content = req.body.content
    const isMain = req.body.isMain === userid ? 1 : 0
    const date = new Date()
    const insertSql = `INSERT INTO topicfollow (userid,topicid,content,isMain,pushtime) values (?,?,?,?,?)`
    db.query(insertSql, [userid, topicid, content, isMain, date], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('添加成功!', 200)
        } else {
            res.cc('添加失败!', 401)
        }

    })
}
exports.updateTopic = (req, res) => {
    const title = req.body.title
    const userid = req.body.userid
    const content = req.body.content
    const topicid = req.body.topicid
    const date = util.clearDataTimeUtil(new Date())
    const updateSql = `update topic set title = ?,content = ?,modify = 3,modifytime=? where userid = ? and topicid = ?`
    db.query(updateSql, [title, content, date, userid, topicid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('添加成功', 200)
        } else {
            res.cc('添加失败', 401)
        }
    })
}