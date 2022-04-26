/*
    在这里定义和管理员相关的路由处理函数，供 /router/adminApi.js 模块进行调用
*/

const jwt = require('jsonwebtoken')
const { jwtSecretKey, expiresIn } = require('../config')
const util = require('./util')
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
    where a.roleid = ?
    order by a.rightid asc`
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
exports.getRolesById = (req, res) => {
    const roleid = req.body.roleid
    const selectSql = `select rolename from roles where roleid = ?`
    db.query(selectSql, [roleid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) res.send({
            status: 200,
            results: results[0]
        })
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
    const state = req.body.state === '0' ? 0 : 1
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
    const newsid = req.body.newsid
    const deleteSql = `delete from news where newsid = ?`
    db.query(deleteSql, [newsid], (err, result) => {
        if (err) res.cc(err)
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
    const selectSql = `select *  from news where newsid =? `
    db.query(selectSql, [newsid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newsResult = util.clearDataTime(results, 'pushtime')
            res.send({
                status: 200,
                results: newsResult[0]
            })
        }
    })
}
exports.getVoluntLIst = (req, res) => {
    const selectSql = `select voluntid,title,status,isrecommend,classification from volunt`
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
exports.deleteVoluntById = (req, res) => {
    const voluntid = req.body.voluntid
    const deleteSql = `delete from volunt where voluntid = ?`
    db.query(deleteSql, [voluntid], (err, result) => {
        if (err) res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
        else res.cc('删除失败！', 401)
    })
}
exports.setHotVolunt = (req, res) => {
    const voluntid = req.body.voluntid
    const isrecommend = req.body.isrecommend === '1' ? 1 : 0
    const updateSql = `update volunt set isrecommend = ? where voluntid = ?`
    db.query(updateSql, [isrecommend, voluntid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc(isrecommend === 1 ? '添加推荐成功！' : '取消推荐成功！', 200)
        else res.cc('修改失败！', 401)
    })
}
exports.setVoluntStatus = (req, res) => {
    const voluntid = req.body.voluntid
    const status = req.body.status
    const updateSql = `update volunt set status = ? where voluntid = ?`
    db.query(updateSql, [status, voluntid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
    })
}
exports.addVolunt = (req, res) => {
    const title = req.body.title
    const content = req.body.content
    const space = req.body.space
    const begintime = req.body.begintime
    const finishtime = req.body.finishtime
    const pic = req.body.pic
    const teamname = req.body.teamname
    const tel = req.body.tel
    const classification = req.body.classification
    const insertSql = `insert into volunt (title, content, space, begintime, finishtime,pic,teamname,tel, classification) values (?,?,?,?,?,?,?,?,?)`
    db.query(insertSql, [title, content, space, begintime, finishtime, pic, teamname, tel, classification], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.cc('发布成功！', 200)
        }
    })
}
exports.getVoluntById = (req, res) => {
    const voluntid = req.body.voluntid
    const selectSql = `select * from volunt where voluntid = ?`
    db.query(selectSql, [voluntid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            res.send({
                status: 200,
                results: results[0]
            })
        }
    })
}
exports.getVoluntUserList = (req, res) => {
    const selectSql = `select a.userid,a.nickname,a.isvolunt,b.voluntinfoid, b.realname,b.gender,b.volunttype,b.residence0,b.residence1,b.residence2,b.education,b.politicalstatus,b.nationality,b.idnumber,b.employment,b.specialty,b.tel
    from userinfo a
    left join uservoluntinfo b
    on a.userid = b.userid
    where a.isvolunt = 1 or a.isvolunt = 2`
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
exports.deleteVoluntUserByUserid = (req, res) => {
    const voluntinfoid = req.body.voluntinfoid
    const userid = req.body.userid
    const deleteSql = `delete from uservoluntinfo where voluntinfoid = ?`
    const updateSql = `update userinfo set isvolunt = 0 where userid = ?`
    db.query(deleteSql, [voluntinfoid], (err, result) => {
        if (err) res.cc(err)
        if (result.affectedRows === 1) {
            db.query(updateSql, [userid], (err1, result1) => {
                if (err1) res.cc(err1)
                if (result1.affectedRows === 1) res.cc('删除成功！', 200)
            })
        }
        else res.cc('删除失败！', 401)
    })
}
exports.setUserIsvolunt = (req, res) => {
    const userid = req.body.userid
    const updateSql = `update userinfo set isvolunt = 1 where userid = ?`
    db.query(updateSql, [userid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
    })
}

exports.getMessageList = (req, res) => {
    const selectSql = `select * from usermessage order by isreply asc`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newResults = util.clearData(results, 'questiontime', 'replytime')
            res.send({
                status: 200,
                results: newResults
            })
        }
    })
}
exports.setUserMessage = (req, res) => {
    const reply = req.body.reply
    const adminid = req.body.adminid
    const messageid = req.body.messageid
    const readMp3 = req.body.read
    const replytime = new Date()
    const updateSql = `update usermessage set isreply = 1, reply = ?,replytime = ?,adminid = ?,readMp3=? where messageid = ?`
    db.query(updateSql, [reply, replytime, adminid, readMp3, messageid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
    })
}
exports.deleteMessageById = (req, res) => {
    const messageid = req.body.messageid
    const deleteSql = `delete from usermessage where messageid = ?`
    db.query(deleteSql, [messageid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.getLawdynamicList = (req, res) => {
    const selectSql = `select * from lawdynamic`
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
exports.deleteLawdynamicById = (req, res) => {
    const dynamicid = req.body.dynamicid
    const deleteSql = `delete from lawdynamic where dynamicid = ?`
    db.query(deleteSql, [dynamicid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.UpdateLawdynamic = (req, res) => {
    const dynamicid = req.body.dynamicid
    const title = req.body.title
    const content = req.body.content
    const theme = req.body.theme
    const themename = theme === '0' ? '主题活动' : (theme === '1' ? '普法锦集' : '环球法治')
    const updateSql = `update lawdynamic set title=?,content=?,theme=?,themename=? where dynamicid= ?`
    db.query(updateSql, [title, content, theme, themename, dynamicid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
    })
}
exports.AddLawdynamic = (req, res) => {
    const title = req.body.title
    const content = req.body.content
    const theme = req.body.theme
    const themename = theme === '0' ? '主题活动' : (theme === '1' ? '普法锦集' : '环球法治')
    const insertSql = `insert into lawdynamic(title, content, theme, themename) values (?,?,?,?)`
    db.query(insertSql, [title, content, theme, themename], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.send({
                status: 200,
                message: '发布成功！',
                dynamicid: result.insertId
            })
        }
    })
}


exports.getServiceList = (req, res) => {
    const selectSql = `select a.servicelistid,a.pic,a.title,a.conpany,a.servicearea,a.province,
    a.city,a.tel,a.serviceid,b.name,b.category
     from servicelist a
     left join service b
     on a.serviceid=b.serviceid`
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
exports.addService = (req, res) => {
    const title = req.body.title
    const conpany = req.body.conpany
    const servicearea = req.body.servicearea
    const province = req.body.province
    const city = req.body.city
    const tel = req.body.tel
    const category = req.body.category
    const name = req.body.name
    const pic = req.body.pic
    const selectSql = `select serviceid from service where name = ?`
    const insertSql = `insert into servicelist (pic,title,conpany,servicearea,province,city,tel,serviceid) 
    values (?,?,?,?,?,?,?,?)`
    db.query(selectSql, [name, category], (err1, results) => {
        if (err1) return res.cc(err1)
        if (results.length > 0) {
            let serviceid = results[0].serviceid
            db.query(insertSql, [pic, title, conpany, servicearea, province, city, tel, serviceid], (err2, result) => {
                if (err2) return res.cc(err2)
                if (result.affectedRows === 1) {
                    res.send({
                        status: 200,
                        message: '发布成功！',
                        servicelistid: result.insertId
                    })
                }
            })
        }
    })
}
exports.UpdateService = (req, res) => {
    const servicelistid = req.body.servicelistid
    const title = req.body.title
    const conpany = req.body.conpany
    const servicearea = req.body.servicearea
    const province = req.body.province
    const city = req.body.city
    const tel = req.body.tel
    const category = req.body.category
    const name = req.body.name
    const pic = req.body.pic
    const selectSql = `select serviceid from service where name = ?`
    const updateSql = `update servicelist set pic = ?, title = ?, conpany = ?, servicearea = ?, province = ?, city = ?, tel = ?,serviceid=? where servicelistid = ?`
    db.query(selectSql, [name, category], (err1, results) => {
        if (err1) return res.cc(err1)
        if (results.length > 0) {
            let serviceid = results[0].serviceid
            db.query(updateSql, [pic, title, conpany, servicearea, province, city, tel, serviceid, servicelistid], (err, result) => {
                if (err) return res.cc(err)
                if (result.affectedRows === 1) res.cc('修改成功！', 200)
            })
        }
    })
}
exports.deleteService = (req, res) => {
    const servicelistid = req.body.servicelistid
    const deleteSql = `delete form servicelist where servicelistid =?`
    db.query(deleteSql, [servicelistid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}

exports.getServiceTabList = (req, res) => {
    const selectSql1 = `select * from servicetab`
    const selectSql2 = `select servicelistid,conpany from servicelist`
    db.query(selectSql2, (err1, results1) => {
        if (err1) return res.cc(err1)
        if (results1.length > 0) {
            db.query(selectSql1, (err2, results2) => {
                if (err2) return res.cc(err2)
                let results = [...results1]
                results.map(item => {
                    let tabs = []
                    results2.map(d => {
                        if (d.servicelistid === item.servicelistid) {
                            tabs.push(d.tabname)
                        }
                    })
                    item.tabs = tabs
                })
                res.send({
                    status: 200,
                    results
                })
            })
        }
    })
}
exports.deleteServiceTab = (req, res) => {
    const servicelistid = req.body.servicelistid
    const tabname = req.body.tabname
    const selectSql = `select tabid from servicetab where servicelistid = ? and tabname = ?`
    const deleteSql = `delete from servicetab where tabid = ?`
    db.query(selectSql, [servicelistid, tabname], (err1, results) => {
        if (err1) return res.cc(err1)
        if (results.length > 0) {
            let tabid = results[0].tabid
            db.query(deleteSql, [tabid], (err2, result) => {
                if (err2) return res.cc(err2)
                if (result.affectedRows === 1) res.cc('删除成功！', 200)
            })
        }
    })
}
exports.addTabname = (req, res) => {
    const servicelistid = req.body.servicelistid
    const tabname = req.body.tabname
    const insertSql = `insert into servicetab (servicelistid, tabname) values (?,?)`
    db.query(insertSql, [servicelistid, tabname], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('添加成功！', 200)
    })
}

exports.getHospitalList = (req, res) => {
    const selectSql = `select * from hospitallist`
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
exports.addHospital = (req, res) => {
    const pic = req.body.pic
    const hospitaladdress = req.body.hospitaladdress
    const hospitalname = req.body.hospitalname
    const introduce = req.body.introduce
    const province = req.body.province
    const city = req.body.city
    const tel = req.body.tel
    const twoDcode = req.body.twoDcode
    const website = req.body.website
    const insertSql = `insert into hospitallist (pic,hospitaladdress, hospitalname, introduce, province, city, tel, twoDcode,website)  values (?,?,?,?,?,?,?,?,?)`
    db.query(insertSql, [pic, hospitaladdress, hospitalname, introduce, province, city, tel, twoDcode, website], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.send({
                status: 200,
                message: '发布成功！',
                hospitallistid: result.insertId
            })
        }
    })
}
exports.UpdateHospital = (req, res) => {
    const hospitallistid = req.body.hospitallistid
    const pic = req.body.pic
    const hospitaladdress = req.body.hospitaladdress
    const hospitalname = req.body.hospitalname
    const introduce = req.body.introduce
    const province = req.body.province
    const city = req.body.city
    const tel = req.body.tel
    const twoDcode = req.body.twoDcode
    const website = req.body.website
    const updateSql = `update hospitallist set pic=?,hospitaladdress=?, hospitalname=?, introduce=?, province=?, city=?, tel=?, twoDcode=?,website=? where hospitallistid = ?`
    db.query(updateSql, [pic, hospitaladdress, hospitalname, introduce, province, city, tel, twoDcode, website, hospitallistid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
    })
}
exports.deleteHospital = (req, res) => {
    const hospitallistid = req.body.hospitallistid
    const deleteSql = `delete from hospitallist where hospitallistid =?`
    db.query(deleteSql, [hospitallistid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.getClinicRecord = (req, res) => {
    const selectSql = `select a.clinicrecord ,a.userid,a.clinicid,a.tel,a.province,a.city,a.address,a.represent,a.detail,a.treatmentdate,a.timeslot,a.status,a.pushtime,a.finishtime,b.name,b.tel as clinictel
    from clinicrecord a left join clinic b on a.clinicid = b.clinicid`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newResults = util.clearData(results, 'treatmentdate')
            newResults = util.clearDataTime(newResults, 'pushtime', 'finishtime')
            newResults.map(item => {
                item.status = item.status === 0 ? '未开始' : (item.status === 1 ? '进行中' : '已结束')
            })
            res.send({
                status: 200,
                results: newResults
            })
        }
    })
}
exports.deleteClinicRecord = (req, res) => {
    const clinicrecord = req.body.clinicrecord
    const deleteSql = `delete from clinicrecord where clinicrecord =?`
    db.query(deleteSql, [clinicrecord], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.updateClinicRecord = (req, res) => {
    const clinicrecord = req.body.clinicrecord
    const status = req.body.status === '未开始' ? 0 : (req.body.status === '进行中' ? 1 : 2)
    const finishtime = new Date()
    const updateSql1 = `update clinicrecord set status = ?, finishtime = ? where clinicrecord = ?`
    const updateSql2 = `update clinicrecord set status = ? where clinicrecord = ?`
    if (status === 2) {
        db.query(updateSql1, [status, finishtime, clinicrecord], (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows === 1) res.cc('修改成功！', 200)
        })
    } else {
        db.query(updateSql2, [status, clinicrecord], (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows === 1) res.cc('修改成功！', 200)
        })
    }
}
exports.getClinic = (req, res) => {
    const selectSql = `select * from clinic`
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
exports.updateClinic = (req, res) => {
    const clinicid = req.body.clinicid
    const name = req.body.name
    const introduce = req.body.introduce
    const tel = req.body.tel
    const address = req.body.address
    const province = req.body.province
    const city = req.body.city
    const updateSql = `update clinic set name = ? , introduce = ? , tel = ?,address=?,province=?,city=? where clinicid = ?`
    db.query(updateSql, [name, introduce, tel, address, province, city, clinicid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
    })
}
exports.deleteClinic = (req, res) => {
    const clinicid = req.body.clinicid
    const deleteSql = `delete from clinic where clinicid =?`
    db.query(deleteSql, [clinicid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.addClinic = (req, res) => {
    const name = req.body.name
    const introduce = req.body.introduce
    const tel = req.body.tel
    const address = req.body.address
    const province = req.body.province
    const city = req.body.city
    const insertSql = `insert into clinic (name, introduce, tel, address, province, city) values (?,?,?,?,?,?)`
    db.query(insertSql, [name, introduce, tel, address, province, city], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.send({
                status: 200,
                message: '添加成功！',
                clinicid: result.insertId
            })
        }
    })
}

exports.getHealthMsg = (req, res) => {
    const selectSql = `select * from healthmsg`
    db.query(selectSql, (err, results) => {
        if (err) res.cc(err)
        if (results.length > 0) {
            let newResults = results
            newResults.map(item => {
                item.grade = item.grade === 1 ? '健康常识' : (item.grade === 2 ? '热点' : '膳食知识')
            })
            newResults = util.clearDataTime(newResults, 'pushtime')
            res.send({
                status: 200,
                results: newResults
            })
        }
    })
}
exports.setHealthMsgIsShow = (req, res) => {
    const healthmsgid = req.body.healthmsgid
    const isshow = req.body.isshow === '1' ? 1 : 0
    const updateSql = `update healthmsg set isshow = ? where healthmsgid = ?`
    db.query(updateSql, [isshow, healthmsgid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc(isshow === 1 ? '添加展示成功！' : '取消展示成功！', 200)
        else res.cc('修改失败！', 401)
    })
}
exports.updateHealthMsg = (req, res) => {
    const healthmsgid = req.body.healthmsgid
    const title = req.body.title
    const pushtime = new Date()
    const intro = req.body.intro
    const grade = req.body.grade === '健康常识' ? 1 : (req.body.grade === '热点' ? 2 : 3)
    const content = req.body.content
    const updateSql = `update healthmsg set title = ? ,pushtime = ?,intro = ? ,grade = ? ,content = ? where healthmsgid = ?`
    db.query(updateSql, [title, pushtime, intro, grade, content, healthmsgid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
    })
}
exports.addHealthMsg = (req, res) => {
    const title = req.body.title
    const pushtime = new Date()
    const intro = req.body.intro
    const grade = req.body.grade === '健康常识' ? 1 : (req.body.grade === '热点' ? 2 : 3)
    const content = req.body.content
    const insertSql = `insert into healthmsg (title,pushtime,intro,grade,content,isshow) values (?,?,?,?,?,0)`
    db.query(insertSql, [title, pushtime, intro, grade, content], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('发布成功！', 200)
    })
}
exports.deleteHealthMsg = (req, res) => {
    const healthmsgid = req.body.healthmsgid
    const deleteSql = `delete from healthmsg where healthmsgid =?`
    db.query(deleteSql, [healthmsgid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.getHealthMsgById = (req, res) => {
    const healthmsgid = req.body.healthmsgid
    const selectSql = `select * from healthmsg where healthmsgid = ?`
    db.query(selectSql, [healthmsgid], (err, results) => {
        if (err) res.cc(err)
        if (results.length > 0) {
            let newResults = results
            newResults.map(item => {
                item.grade = item.grade === 1 ? '健康常识' : (item.grade === 2 ? '热点' : '膳食知识')
            })
            newResults = util.clearDataTime(newResults, 'pushtime')
            res.send({
                status: 200,
                results: newResults[0]
            })
        }
    })
}
exports.getHoardCateList = (req, res) => {
    const selectSql = `select * from hoardcate`
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
exports.updateHoardCate = (req, res) => {
    const hoardcate = req.body.hoardcate
    const hoardcateid = req.body.hoardcateid
    const updateSql = `update hoardcate set hoardcate = ? where hoardcateid = ?`
    db.query(updateSql, [hoardcate, hoardcateid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
    })
}
exports.addHoardCate = (req, res) => {
    const hoardcate = req.body.hoardcate
    const insertSql = `insert into hoardcate (hoardcate) values (?)`
    db.query(insertSql, [hoardcate], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) {
            res.send({
                status: 200,
                message: '发布成功！',
                hoardcateid: result.insertId
            })
        }
    })
}
exports.deleteHoardCateById = (req, res) => {
    const hoardcateid = req.body.hoardcateid
    const deleteSql = `delete from hoardcate where hoardcateid = ?`
    db.query(deleteSql, [hoardcateid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.getTopicList = (req, res) => {
    const selectSql = `select a.topicid,a.userid,a.title,a.ishot,a.cateid,b.hoardcate from topic a
    left join hoardcate b on a.cateid = b.hoardcateid`
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
exports.deleteTopic = (req, res) => {
    const topicid = req.body.topicid
    const deleteSql = `delete from topic where topicid = ?`
    db.query(deleteSql, [topicid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.setTopicIsHot = (req, res) => {
    const topicid = req.body.topicid
    const ishot = req.body.ishot
    const updateSql = `update topic set ishot = ? where topicid = ?`
    db.query(updateSql, [ishot, topicid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('修改成功！', 200)
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
exports.deleteTopicFollowById = (req, res) => {
    const topicfollowid = req.body.topicfollowid
    const deleteSql = `delete from topicfollow where topicfollowid = ?`
    db.query(deleteSql, [topicfollowid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}
exports.deleteCommentById = (req, res) => {
    const topiccommentid = req.body.topiccommentid
    const deleteSql1 = `delete from topiccomment where topiccommentid = ?`
    const selectSql = `select topiccommentid from topiccomment where parentid = ? `
    const deleteSql2 = `delete from topiccomment where FIND_IN_SET(topiccommentid,?)`
    db.query(deleteSql1, [topiccommentid], (err1, result1) => {
        if (err1) return res.cc(err1)
        if (result1.affectedRows === 1) {
            db.query(selectSql, [topiccommentid], (err2, results) => {
                if (err2) return console.log(err2)
                if (results.length > 0) {
                    let arr = []
                    results.map(item => arr.push(item.topiccommentid))
                    db.query(deleteSql2, [...arr], (err3) => {
                        if (err3) return res.cc(err3)
                        res.cc('删除成功！', 200)
                    })
                }
            })
        }
    })
}
exports.deleteSonCommentById = (req, res) => {
    const topiccommentid = req.body.topiccommentid
    const deleteSql = `delete from topiccomment where topiccommentid = ?`
    db.query(deleteSql, [topiccommentid], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows === 1) res.cc('删除成功！', 200)
    })
}

exports.getHomeNews = (req, res) => {
    const selectSql = `select count(newsid) as count ,sum(a.great) as greatSum,sum(a.collect) as collectSum,b.categoryid,b.categoryname from news a
    left join newscategory b on a.categoryid = b.categoryid group by categoryid; `
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) res.send({
            status: 200,
            results
        })
    })
}
exports.getLawdynamicCount = (req, res) => {
    const selectSql = `select count(dynamicid) as count,themename from lawdynamic group by themename;`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) res.send({
            status: 200,
            results
        })
    })
}
exports.getHomeService = (req, res) => {
    const selectSql = `select count(a.servicelistid) as count ,a.serviceid,b.name from servicelist a left join service b on a.serviceid = b.serviceid group by a.serviceid`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) res.send({
            status: 200,
            results
        })
    })
}
exports.getHomeHealthMsg = (req, res) => {
    const selectSql = `select count(healthmsgid) as count,grade from healthmsg group by grade;`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) res.send({
            status: 200,
            results
        })
    })
}
exports.getHomeClinicRecord = (req, res) => {
    const selectSql = `select count(clinicrecord) as count,timeslot from clinicrecord group by timeslot;`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) res.send({
            status: 200,
            results
        })
    })
}
exports.getHomeHealthInfo = (req, res) => {
    const selectSql1 = `select count(hospitallistid) as Hcount from hospitallist`
    const selectSql2 = `select count(clinicid) as Ccount from clinic`
    const selectSql3 = `select count(clinicrecord) as Rcount from clinicrecord`
    db.query(selectSql1, (err1, results1) => {
        if (err1) return res.cc(err1)
        db.query(selectSql2, (err2, results2) => {
            if (err2) return res.cc(err2)
            db.query(selectSql3, (err3, results3) => {
                if (err3) return res.cc(err3)
                res.send({
                    status: 200,
                    counts: [results1[0], results2[0], results3[0]],
                })
            })
        })
    })
}
exports.getHomeHoard = (req, res) => {
    const selectSql = `select count(a.topicid) as count,b.hoardcate from topic a left join hoardcate b on a.cateid = b.hoardcateid group by a.cateid`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) res.send({
            status: 200,
            results
        })
    })
}
exports.getTopicHitTop5 = (req, res) => {
    const selectSql1 = `select title,hits,topicid from topic order by hits desc limit 0,4;`
    const selectSql2 = `select title,star,topicid from topic order by star desc limit 0,4;`
    db.query(selectSql1, (err, results) => {
        if (err) return res.cc(err)
        db.query(selectSql2, (err1, results1) => {
            if (err1) return res.cc(err1)
            res.send({
                status: 200,
                topicHitTop: results,
                topicStarTop: results1
            })
        })
    })
}