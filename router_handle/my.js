
// 导入 数据库 操作模块
const e = require('express')
const db = require('../db/index')
const util = require('./util')

exports.getAllInfo = (req, res) => {
    const id = req.body.id
    const userid = req.body.userid
    const selectSql = id === userid ?
        `select a.userid,a.nickname,a.avatar,a.age,a.isvolunt,a.voluntcount,a.fans,a.attention,
    b.realname,b.gender,b.volunttype,b.residence0,b.residence1,b.residence2,b.education,b.politicalstatus,b.nationality,b.idnumber,b.employment,b.specialty,b.tel
    from userinfo a
    left join uservoluntinfo b
    on a.userid = b.userid
    where a.userid = ?`:
        `select a.userid,a.nickname,a.avatar,a.age,a.isvolunt,a.voluntcount,a.fans,a.attention,
    b.gender,b.volunttype,b.education,b.politicalstatus,b.nationality,b.employment,b.specialty
    from userinfo a
    left join uservoluntinfo b
    on a.userid = b.userid
    where a.userid = ?`
    db.query(selectSql, [id], (err, result) => {
        if (err) return res.cc(err)
        if (result.length > 0) {
            res.send({
                status: 200,
                result: result[0]
            })
        } else {
            res.cc('未查询到数据')
        }
    })
}
exports.updateNickname = (req, res) => {
    const nickname = req.body.nickname
    const userid = req.body.userid
    const updateSql = `update userinfo set nickname = ? where userid = ?`
    db.query(updateSql, [nickname, userid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('修改成功！', 200)
        } else {
            res.cc('修改失败！', 401)
        }
    })
}
exports.saveUserAvatar = (req, res) => {
    const avatar = req.body.avatar
    const userid = req.body.userid
    const updateSql = `update userinfo set avatar = ? where userid = ?`
    db.query(updateSql, [avatar, userid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('修改成功！', 200)
        } else {
            res.cc('修改失败！', 401)
        }
    })
}
exports.getCollect = (req, res) => {
    const userid = req.body.userid
    const selectNSql = `select a.objectid,a.cateid,a.id,b.title
    from user_behavior a
    left join news b
    on a.objectid = b.newsid
    where a.userid = ? and a.cateid = 1 and a.collect = 1`
    const selectVSql = `select a.objectid,a.cateid,a.id,b.title
    from user_behavior a
    left join volunt b
    on a.objectid = b.voluntid
    where a.userid = ? and a.cateid = 2 and a.collect = 1`
    db.query(selectNSql, [userid], (err1, result1) => {
        if (err1) return res.cc(err1);
        if (result1.length > 0) {
            db.query(selectVSql, [userid], (err2, result2) => {
                if (err2) return res.cc(err2);
                res.send({
                    status: 200,
                    newsresults: result1,
                    voluntresults: result2
                })
            })
        }
    })
}
exports.getHoard = (req, res) => {
    const userid = req.body.userid
    const selectSql = `select topicid,modify,title,cateid,pushtime,hits,star from topic where userid = ? and modify = 0 or modify = -1 or modify = 3 or modify = 1`
    const selectSql1 = `select a.topicfollowid,a.topicid,a.content,a.pushtime 
    from topicfollow a
    left join topic b on a.topicid = b.topicid
    where a.userid = ? and a.modify = 0 and b.modify  = 0`
    db.query(selectSql, [userid], (err1, results1) => {
        if (err1) return res.cc(err1);
        if (results1.length > 0) {
            db.query(selectSql1, [userid], (err2, results2) => {
                if (err2) return res.cc(err2)
                if (results2.length > 0) {
                    let newresults1 = util.clearDataTime(results1, 'pushtime')
                    let newresults2 = util.clearDataTime(results2, 'pushtime')
                    res.send({
                        status: 200,
                        topicresults: newresults1,
                        followresults: newresults2
                    })
                } else res.cc('查询失败！', 401)
            })
        } else res.cc('查询失败！', 401)
    })
}
exports.updateTopic = (req, res) => {
    const userid = req.body.userid
    const modify = req.body.modify
    const topicid = req.body.topicid
    const date = new Date()
    const updateSql = `update topic set modify = ? , modifytime = ? where topicid = ? and userid = ?`
    db.query(updateSql, [modify, date, topicid, userid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
        else res.cc('删除失败！', 401)
    })
}
exports.deleteFollowTopic = (req, res) => {
    const userid = req.body.userid
    const topicfollowid = req.body.topicfollowid
    const date = new Date()
    const updateSql = `update topicfollow set modify = 2,modifytime = ? where userid = ? and topicfollowid = ?`
    db.query(updateSql, [date, userid, topicfollowid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
        else res.cc('删除失败！', 401)
    })
}
exports.getMessage = (req, res) => {
    const userid = req.body.userid
    const selectSql = `select messageid,title,isopen,isreply,questiontime from usermessage where userid = ? and modify = 0`
    db.query(selectSql, [userid], (err, results) => {
        if (err) res.cc(err)
        if (results.length > 0) {
            let newresults = util.clearData(results, 'questiontime')
            res.send({
                status: 200,
                results: newresults
            })
        } else {
            res.cc('未查询到数据', 401)
        }
    })
}
exports.deleteMessage = (req, res) => {
    const messageid = req.body.messageid
    const updateSql = `update usermessage set modify = 2 where messageid = ?`
    db.query(updateSql, [messageid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
        else res.cc('删除失败！', 401)
    })
}
exports.updateMessageOpen = (req, res) => {
    const messageid = req.body.messageid
    const checked = req.body.checked
    let isopen = checked === 'true' ? 1 : 0
    const updateSql = `update usermessage set isopen = ? where messageid = ?`
    db.query(updateSql, [isopen, messageid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
        else res.cc('修改失败！', 401)
    })
}
exports.getVoluntByUserid = (req, res) => {
    userid = req.body.userid
    const selectSql = `select a.voluntid,b.title,b.begintime,b.finishtime,b.status
    from uservoluntrecord a
    left join volunt b 
    on a.voluntid = b.voluntid
    where a.userid = ?`
    db.query(selectSql, [userid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newresults = util.clearData(results, 'begintime', 'finishtime')
            res.send({
                status: 200,
                results: newresults
            })
        } else res.cc('未查询到数据', 401)
    })
}

exports.isAttention = (req, res) => {
    const id = req.body.id
    const userid = req.body.userid
    const selectSql = `select attentionid from attention where userid = ? and Auserid = ?`
    db.query(selectSql, [userid, id], (err, result) => {
        if (err) return res.cc(err)
        if (result.length > 0) {
            res.send({
                status: 200,
                isAttention: true
            })
        }
        else {
            res.send({
                status: 200,
                isAttention: false
            })
        }
    })
}
exports.addAttention = (req, res) => {
    const boolean = req.body.boolean
    const id = req.body.id
    const userid = req.body.userid
    const insertSql = `insert into attention (userid,Auserid) values (?,?)`
    const updateSql1 = `update userinfo set fans = fans+? where userid = ?`
    const updateSql2 = `update userinfo set attention = attention+? where userid = ?`
    const deleteSql = `delete from attention where userid = ? and Auserid = ?`
    if (boolean === 'true') {
        db.query(insertSql, [userid, id], (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows === 1) {
                db.query(updateSql1, [1, id])
                db.query(updateSql2, [1, userid])
                res.send({
                    status: 200,
                    message: '关注成功！'
                })
            }
            else {
                res.send({
                    status: 401,
                    message: '关注失败！'
                })
            }
        })
    } else {
        db.query(deleteSql, [userid, id], (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows === 1) {
                db.query(updateSql1, [-1, id])
                db.query(updateSql2, [-1, userid])
                res.send({
                    status: 200,
                    message: '取消成功！'
                })
            }
            else {
                res.send({
                    status: 401,
                    message: '取消失败！'
                })
            }
        })
    }
}