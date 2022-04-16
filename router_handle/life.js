/*
    在这里定义和生活服务相关的路由处理函数，供 /router/life.js 模块进行调用
*/
// 导入 数据库 操作模块
const db = require('../db/index')
const axios = require('axios')
const util = require('./util')

clearData = (str, ...arr) => {
    str.map(item => {
        arr.map(arritem => {
            item[arritem] = clearDataUtil(new Date(item[arritem]))
        })
    })
    return str
}
const clearDataUtil = (time) => {
    let y = time.getFullYear()
    let M = time.getMonth() + 1
    M = M > 9 ? M : '0' + M
    let d = time.getDate()
    return `${y}-${M}-${d}`
}

exports.voluntlist = (req, res) => {
    const status = {
        '未开始': 0,
        '进行中': 1,
        '已结束': 2,
    }
    const voluntStatus = req.body.voluntStatus
    const selectSql = `select voluntid,title,space,begintime,finishtime,pic,status,teamname,classification,peoplenumber from volunt where status = ?`
    db.query(selectSql, [status[voluntStatus]], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let Newsresults = util.clearData(results, 'begintime', 'finishtime')
            return res.send({
                status: 200,
                msg: '成功',
                results: Newsresults,
            })
        }
        res.cc('查询失败', 401)
    })

}
exports.voluntdetail = (req, res) => {
    const voluntid = req.body.voluntid
    const selectSql = `select * from volunt where voluntid = ?`
    const selectUserSql = `select a.userid,b.nickname,b.avatar from uservoluntrecord a join userinfo b on a.userid = b.userid where a.voluntid = ?`
    db.query(selectSql, [voluntid], (err1, results1) => {
        if (err1) return res.cc(err1)
        if (results1.length > 0) {
            let Newsresults = util.clearData(results1, 'begintime', 'finishtime')
            db.query(selectUserSql, [voluntid], (err2, results2) => {
                if (err2) return res.cc(err2)
                Newsresults[0].partners = results2
                return res.send({
                    status: 200,
                    msg: '成功',
                    results: Newsresults[0],
                })
            })
            return
        }
        return res.cc('查询失败', 401)
    })

}
exports.isVolunt = (req, res) => {
    const userid = req.body.userid
    const voluntid = req.body.voluntid
    const selectSql = `select * from uservoluntrecord where userid = ? and voluntid = ?`
    db.query(selectSql, [userid, voluntid], (err, result) => {
        if (err) return res.cc(err)
        if (result.length > 0) {
            return res.send({
                isvolunt: true
            })
        } else {
            return res.send({
                isvolunt: false
            })
        }
    })
}
exports.joinin = (req, res) => {
    const join = req.body.join
    const userid = req.body.userid
    const voluntid = req.body.voluntid
    const insertSql = `insert into uservoluntrecord (userid,voluntid) VALUES (?, ?)`
    const deleteSql = `delete from uservoluntrecord where userid = ? and voluntid = ?`
    const updataVSql = `update volunt set peoplenumber = peoplenumber + ? where voluntid = ? `
    const selectUserSql = `select a.userid,b.nickname,b.avatar from uservoluntrecord a join userinfo b on a.userid = b.userid where a.voluntid = ?`
    const updateUSql = `update userinfo set voluntcount = voluntcount + ? where userid = ?`
    if (join === 'true') {
        db.query(insertSql, [userid, voluntid], (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows === 1) {
                db.query(updataVSql, [1, voluntid])
                db.query(selectUserSql, [voluntid], (err, result1) => {
                    if (err) return res.cc(err)
                    db.query(updateUSql, [1, userid])
                    res.send({
                        status: 200,
                        msg: '报名成功！',
                        partners: result1
                    })
                })
            } else {
                res.send({
                    status: 401,
                    msg: '报名失败！'
                })
            }
        })
    } else {
        db.query(deleteSql, [userid, voluntid], (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows === 1) {
                db.query(updataVSql, [-1, voluntid])
                db.query(selectUserSql, [voluntid], (err, result1) => {
                    if (err) return res.cc(err)
                    db.query(updateUSql, [-1, userid])
                    res.send({
                        status: 200,
                        msg: '退出成功！',
                        partners: result1
                    })
                })
            }
        })
    }
}
exports.isCollect = (req, res) => {
    const userid = req.body.userid
    const objectid = req.body.objectid
    const cateid = req.body.cateid
    const selectSql = `select collect from user_behavior where userid = ? and objectid = ? and cateid = ?`
    db.query(selectSql, [userid, objectid, cateid], (err, result) => {
        if (err) return res.cc(err)
        if (result.length === 0 || result[0].collect === -1) {
            return res.send({
                iscollect: false
            })
        } else {
            return res.send({
                iscollect: true
            })
        }
    })
}
exports.turnCollect = (req, res) => {
    const userid = req.body.userid
    const objectid = req.body.objectid
    const cateid = req.body.cateid
    const turn = req.body.turn === 'false' ? -1 : 1
    const selectSql = `select * from user_behavior where userid = ? and objectid = ? and cateid = ?`
    const updataSql = `update user_behavior set collect  = ? where userid = ? and objectid = ? and cateid = ?`
    const insertSql = `insert into user_behavior (userid,objectid,cateid) values (?,?,?)`
    db.query(selectSql, [userid, objectid, cateid], (err, results1) => {
        if (err) return res.cc(err)
        if (results1.length > 0) {
            db.query(updataSql, [turn, userid, objectid, cateid])
            return
        } else {
            db.query(insertSql, [userid, objectid, cateid])
            return
        }
    })
}
exports.getvolunthot = (req, res) => {
    const selectSql = `select * from volunt where isrecommend = 1`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let Newsresults = util.clearData(results, 'begintime', 'finishtime')
            res.send({
                status: 200,
                results: Newsresults
            })
        }
    })
}
exports.voluntaddinfo = (req, res) => {
    const values = req.body
    const insertSql = `insert into uservoluntinfo set ?`
    const updateSql = `update userinfo set isvolunt = 1 where userid = ?`
    const selectSql = `select userid from uservoluntinfo where userid = ? `
    const updateUserVInfoSql = `update uservoluntinfo set ?  where userid = ? `
    db.query(selectSql, [values.userid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            db.query(updateUserVInfoSql, [values, values.userid], (err1, results1) => {
                if (err) res.cc(err);
                res.send({
                    status: 200,
                    msg: '修改成功！'
                })
            })
        } else {
            db.query(insertSql, [values],)
            db.query(updateSql, [values.userid])
            res.send({
                status: 200,
                msg: '注册成功！'
            })
        }
    })
}
exports.lawMessage = (req, res) => {
    const values = req.body
    let date = new Date()
    values.questiontime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    const insertSql = `insert into usermessage set ?`
    db.query(insertSql, [values], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('留言成功！可以到个人中心查看留言情况', 200)
        } else {
            res.cc('留言失败，请稍后再试！', 401)
        }
    })
}
exports.getmessage = (req, res) => {
    const selectSql = `select messageid,title from usermessage where isopen = 1 and isreply = 1 and modify = 0`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            res.send({
                status: 200,
                results
            })
        } else {
            res.cc('没查询到值', 401)
        }
    })
}
exports.getdynamic = (req, res) => {

    const selectSql = `select * from lawdynamic`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let datas = []
            datas[0] = results.filter(item => item.theme === 0)
            datas[1] = results.filter(item => item.theme === 1)
            datas[2] = results.filter(item => item.theme === 2)
            res.send({
                status: 200,
                results: datas
            })
        } else {
            res.cc('查询失败!', 401)
        }
    })
}
exports.lawdetail = (req, res) => {
    const messageid = req.body.messageid
    const selectSql = `select * from usermessage where messageid = ?`
    db.query(selectSql, [messageid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            const Newsresults = util.clearData(results, 'questiontime', 'replytime')
            res.send({
                status: 200,
                result: Newsresults[0]
            })
        } else {
            res.cc('查询不到', 401)
        }
    })
}
exports.getService = (req, res) => {
    const selectSql = `select * from service`
    const selectSql1 = `select distinct(category) from service`
    const selectSql2 = `select distinct(pic) from service`
    db.query(selectSql1, (err1, results) => {
        if (err1) return res.cc(err1)
        if (results.length > 0) {
            db.query(selectSql2, (err3, results2) => {
                db.query(selectSql, (err, results3) => {
                    let data = []
                    results.map((item, index) => {
                        data[index] = {
                            category: item.category,
                            list: results3.filter(item1 => { return item1.category === item.category }),
                            pic: results2[index].pic
                        }
                    })
                    res.send({
                        status: 200,
                        results: data
                    })
                })
            })
        } else {
            res.cc('查询失败', 401)
        }
    })
}
exports.getServiceList = (req, res) => {
    const serviceid = req.body.serviceid
    let city = req.body.city
    city = typeof city === "undefined" ? "天津市" : city
    const selectSql = `select * from servicelist where city = ? and serviceid = ?`
    const selectTabSql = `select * from servicetab`
    db.query(selectSql, [city, serviceid], (err1, results1) => {
        if (err1) return res.cc(err1)
        if (results1.length > 0) {
            db.query(selectTabSql, (err2, results2) => {
                if (err2) return res.cc(err2)
                results1.map(item => {
                    item.tabs = results2.filter(item1 => {
                        return item1.servicelistid === item.servicelistid
                    })
                })
                res.send({
                    status: 200,
                    results: results1
                })
            })
        } else {
            res.cc('查询失败', 401)
        }
    })
}
// 填写数据库专用 和 程序没有关系
// exports.test = (req, res) => {
//     const Sql = `INSERT INTO servicetab (servicelistid, tabname) VALUES (?, ?) `
//     const arr = ['全程保险', '全量背调', '体检上岗', '企业认证', '在线预约', '会员11年', '服务好', '保姆', '个人认证', '24小时']
//     for (let i = 0; i < 124; i++) {
//         let ran = Math.round(Math.random() * 10);
//         db.query(Sql, [i, arr[ran]])
//     }
//     res.send({
//         status: 'success'
//     })

// }

exports.getMp3 = (req, res) => {
    const tex = req.body.tex
    var AipSpeechClient = require("baidu-aip-sdk").speech;
    // 设置APPID/AK/SK
    var APP_ID = "25883932";
    var API_KEY = "vSXDU1oc1feHdWszpxVLBZSx";
    var SECRET_KEY = "uBvX5Op5UlsxlRQaMhnEW7ZCCkZX33Ry";
    // 新建一个对象，建议只保存一个对象调用服务接口
    var client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);
    var HttpClient = require("baidu-aip-sdk").HttpClient;
    // 设置request库的一些参数，例如代理服务地址，超时时间等
    // request参数请参考 https://github.com/request/request#requestoptions-callback
    HttpClient.setRequestOptions({ timeout: 5000 });
    // 语音合成
    var fs = require('fs');
    // 语音合成, 附带可选参数
    client.text2audio(tex, { spd: 5, per: 103 }).then(function (result) {
        if (result.data) {
            res.send({
                status: 200,
                result: result.data
            })
        } else {
            // 服务发生错误
            console.log(result)
        }
    }, function (e) {
        // 发生网络错误
        console.log(e)
    });
}

exports.getVoluntInfo = (req, res) => {
    const userid = req.body.userid
    const selectSql = `select * from uservoluntinfo where userid = ?`
    db.query(selectSql, [userid], (err, result) => {
        if (err) return res.cc(err)
        if (result.length > 0) {
            res.send({
                status: 200,
                result: result[0]
            })
        }
    })
}