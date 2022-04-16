/*
    在这里定义和健康管理相关的路由处理函数，供 /router/health.js 模块进行调用
*/

const db = require('../db/index')

const util = require('./util')

exports.getHospitalList = (req, res) => {
    const key = req.body.key
    let selectSql = ``
    if (key === '全国') {
        selectSql = `select * from hospitallist`
    } else if (key.indexOf('0') !== -1) {
        selectSql = `select * from hospitallist where province = '${key.split('0')[0]}'`
    } else if (key.indexOf('1') !== -1) {
        selectSql = `select * from hospitallist where city = '${key.split('1')[0]}'`
        // selectSql = `select * from hospitallist where city = '新乡市'`
    } else {
        return res.cc('出错', 401)
    }
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
exports.getclinicList = (req, res) => {
    province = req.body.province
    city = req.body.city
    const selectSql = `select * from clinic where city = ?`
    const selectSql1 = `select * from clinic where province = ?`
    db.query(selectSql, [city], (err1, results) => {
        if (err1) return res.cc(err1)
        if (results.length > 0) {
            res.send({
                status: 200,
                results
            })
        } else {
            db.query(selectSql1, [province], (err2, results1) => {
                if (err2) return res.cc(err2)
                if (results1.length > 0) {
                    res.send({
                        status: 200,
                        results1
                    })
                } else {
                    res.cc('查询不到', 401)
                }
            })
        }
    })
}
exports.setClinicRecord = (req, res) => {
    // const userid = req.body.userid
    let userid = '3'
    // const clinicid = req.body.clinicid
    let clinicid = '15'
    let tel = req.body.tel
    let province = req.body.province
    let city = req.body.city
    let address = req.body.address
    let describe = req.body.describe
    let describedetail = req.body.describedetail
    let date = req.body.date
    let timeslot = req.body.timeslot
    let datetime = new Date()
    const insertSql = `insert into clinicrecord (userid, clinicid, tel, province, city, address, represent, detail, treatmentdate, timeslot,pushtime) values (?,?,?,?,?,?,?,?,?,?,?) `
    db.query(insertSql, [userid, clinicid, tel, province, city, address, describe, describedetail, date, timeslot, datetime], (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows === 1) {
            res.send({ status: 200 })
        }
    })

}
exports.getgameone = (req, res) => {
    const selectSql = `select * from game1`
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

exports.getUserHistorySearch = (req, res) => {
    const userid = req.body.userid
    const selectSql = `select historylist from historicalsearch where userid = ?`
    db.query(selectSql, [userid], (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let newRes = []
            results.map(item => {
                newRes.push(item.historylist)
            })
            res.send({
                status: 200,
                results: newRes
            })
        } else {
            res.send({
                status: 200,
                results: []
            })
        }
    })
}
exports.addUserHistorySearch = (req, res) => {
    const userid = req.body.userid
    const value = req.body.value
    const insertSql = `insert into historicalsearch (userid , historylist) values (?,?)`
    db.query(insertSql, [userid, value], (err) => {
        if (err) return res.cc(err)
    })
}
exports.getShowMsg = (req, res) => {
    const selectSql = `select healthmsgid,title,intro from healthmsg where isshow = 1`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            res.send({
                status: 200,
                results
            })
        } else {
            res.cc('未查询到数据', 401)
        }
    })
}

exports.getMsg = (req, res) => {
    const selectSql = `select healthmsgid,title,grade from healthmsg`
    db.query(selectSql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 0) {
            let grade1 = []
            let grade2 = []
            let grade3 = []
            results.map(item => {
                if (item.grade === 1) { grade1.push(item) }
                if (item.grade === 2) { grade2.push(item) }
                if (item.grade === 3) { grade3.push(item) }
            })
            res.send({
                status: 200,
                results: [grade1, grade2, grade3]
            })
        } else {
            res.cc('未查询到数据', 401)
        }
    })
}
exports.getMsgDetail = (req, res) => {
    const healthmsgid = req.body.healthmsgid
    const selectSql = `select title,pushtime,intro,content from healthmsg where healthmsgid = ?`
    db.query(selectSql, [healthmsgid], (err, result) => {
        if (err) return res.cc(err)
        if (result.length > 0) {
            let newResult = util.clearDataTime(result, 'pushtime')
            res.send({
                status: 200,
                result: newResult
            })
        } else {
            res.cc('未查询到数据', 401)
        }
    })
}


exports.getMsgForKey = (req, res) => {
    let key = req.body.key
    key = '%' + key + '%'
    const selectSql = `select healthmsgid,title,pushtime,intro from healthmsg where title like ?`
    db.query(selectSql, [key], (err, results) => {
        if (err) return res.cc(err)
        let newResults = util.clearDataTime(results, 'pushtime')
        if (results.length > 0) {
            return res.send({
                status: 200,
                results: newResults
            })
        } else {
            res.cc('未查询到数据', 401)
        }
    })
}

