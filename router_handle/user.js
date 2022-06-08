/*
    在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
*/
const axios = require('axios')
// 导入 数据库 操作模块
const db = require('../db/index')

// 导入 加密的包
const bcrypt = require('bcryptjs')
// 导入qs
const qs = require('qs')
//定义计时器 容器
let timer = {}

//账号登录
exports.usernameLogin = (req, res) => {
  const username = req.body.username
  const password = req.body.password
  // 对表单中的数据进行合法性的校验
  const selectSql = `select * from user where username = ?`
  db.query(selectSql, [username], (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('用户不存在，请注册', 401)
    // 拿着用户输入的密码，和数据库中储存的密码进行比对
    const compareResult = bcrypt.compareSync(password, results[0].password)
    // 如果对比的结果等于 false，则证明用户输入的密码错误
    if (!compareResult) return res.cc('密码错误', 401)
    // 查询用户信息   返回token

    const selectInfo = `select * from userinfo where userid = ?`
    db.query(selectInfo, [results[0].userid], (err, result1) => {
      let data = {
        username,
        userid: results[0].userid,
        nickname: result1[0].nickname,
        avatar: result1[0].avatar,
        isvolunt: result1[0].isvolunt,
      }
      let token = qs.stringify(data)
      res.send({
        status: 200,
        message: '登录成功',
        token,
      })
    })

  })
}
const deleteCode = (tel, boolean) => {
  const deleteSql = `delete from tel where tel = ?`
  // 开启计时器 设置时间 5分钟
  console.log('开启计时器' + tel)
  if (boolean) {
    timer[tel] = setTimeout(function () {
      db.query(deleteSql, [tel], (err) => {
        if (err) return res.cc(err)
      })
      clearTimeout(timer[tel])
      console.log('关闭计时器' + tel)
    }, 60000)
  } else {
    db.query(deleteSql, [tel], (err) => {
      if (err) return res.cc(err)
    })
    clearTimeout(timer[tel])
    console.log('直接关闭计时器' + tel)
  }
}
// 发送验证码  tel
exports.getCode = (req, res) => {
  const tel = req.body.tel
  // 生成验证码
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += Math.floor(Math.random() * 10)
  }
  // 发送验证码
  axios
    .post(
      'https://gyytz.market.alicloudapi.com/sms/smsSend',
      {},
      {
        params: {
          mobile: tel,
          param: '**code**:' + code + ',**minute**:5',
          smsSignId: '2e65b1bb3d054466b82f0c9d125465e2',
          templateId: '908e94ccf08b4476ba6c876d13f084ad',
        },
        headers: {
          Authorization: 'APPCODE 62d81147138c448c8a3c5fd03290e308',
        },
      }
    )
    .then((result) => {
      // 如果成功 code===0 短信发送成功
      // result.data.code === '0'
      if (result.data.code === '0') {
        console.log(code)
        res.send({
          state: 200,
          msg: '短信发送成功！',
          code, //后续删除
        })
        // 将code和手机号 临时存到一个表中  并设置计时器 5分钟后将手机号删除
        // 检查如果表里 手机号存在则 替换 若不存在则添加
        const selectSql = `select * from tel where tel = ?`
        const updateSql = `update tel set code = ? where tel = ?`
        const insertSql = `insert tel set ?`
        const deleteSql = `delete from tel where tel = ?`
        db.query(selectSql, [tel], (err, result) => {
          if (err) return res.cc(err)
          if (result.length === 1) {
            db.query(updateSql, [code, tel], (err) => {
              if (err) return res.cc(err)
            })
          } else {
            db.query(insertSql, { tel, code }, (err) => {
              if (err) return res.cc(err)
            })
          }
        })
        deleteCode(tel, true)
      } else {
        res.end({
          status: 401,
          msg: '验证码发送失败',
        })
      }
    })
}
exports.telLogin = (req, res) => {
  tel = req.body.tel
  code = req.body.code
  // 查询手机号-code 存储表中 是否有记录 是否对照
  const selectSql = `select code from tel where tel = ?`
  const selectSql1 = `select userid,username from user where tel = ?`
  const insertSql = `insert user set ?`
  const insertInfo = `insert into userinfo (userid,nickname) values (?, ?)`
  db.query(selectSql, [tel], (err, result) => {
    if (err) return res.cc(err)
    // 如果验证码表中有这个手机号
    if (result.length === 1) {
      // 判断 验证码是否相同 相同则登录成功
      if (result[0].code === code) {
        // 向用户表中查询是否有这个用户 若没有则插入这个用户
        db.query(selectSql1, [tel], (err1, result1) => {
          if (err1) return res.cc(err1)
          let data = {}
          if (result1.length !== 1) {
            db.query(insertSql, { tel }, (err2, result2) => {
              if (err2) return res.cc(err2)
              db.query(insertInfo, [result2.insertId, tel])
              data = {
                userid: result2.insertId,
                nickname: tel,
                avatar: 'http://127.0.0.1:8002/uploads/header/avatar_demo.png',
                tel,
                isvolunt: 0,
              }
              let token = qs.stringify(data)
              res.send({
                status: 200,
                msg: '登录成功',
                token,
              })
            })
          } else {
            // 查询用户信息 生成token
            const selectInfo = `select * from userinfo where userid = ?`
            db.query(selectInfo, [result1[0].userid], (err3, result3) => {
              if (err3) return res.cc(err3)
              data = {
                tel,
                userid: result1[0].userid,
                nickname: result3[0].nickname,
                avatar: result3[0].avatar,
                isvolunt: result3[0].isvolunt,
              }
              let token = qs.stringify(data)
              console.log(token);
              res.send({
                status: 200,
                msg: '登录成功',
                token,
              })
            })
          }

          deleteCode(tel, false)
        })
      } else {
        return res.cc('验证码错误', 401)
      }
    } else {
      res.cc('验证码错误', 401)
    }
  })
}
exports.register = (req, res) => {
  const username = req.body.username
  const code = req.body.code
  const tel = req.body.tel
  const pwd = req.body.password
  const selectCodeSql = `select code from tel where tel = ?`
  const selectUsernameSql = `select * from user where username = ?`
  const selectTelSql = `select * from user where tel = ?`
  const insertSql = `insert user set ?`
  const insertInfo = `insert into userinfo (userid,nickname) values (?, ?)`
  db.query(selectCodeSql, [tel], (err, result) => {
    if (err) return res.cc(err)
    if (result.length === 1) {
      if (result[0].code === code) {
        db.query(selectUsernameSql, [username], (err, result) => {
          if (err) return res.cc(err)
          if (result.length === 1) return res.cc('用户名已存在', 401)
          db.query(selectTelSql, [tel], (err, result) => {
            if (err) return res.cc(err)
            if (result.length === 1) return res.cc('手机号已被注册', 401)
            password = bcrypt.hashSync(pwd, 10)
            // 向数据库中插入信息
            db.query(insertSql, { username, password, tel }, (err, result) => {
              db.query(insertInfo, [result.insertId, username])
              // 查询用户信息   返回token
              let data = {
                name: username,
                nickname: username,
                tel: tel,
                avatar: 'http://127.0.0.1:8002/uploads/header/avatar_demo.png',
                userid: result.insertId,
                isvolunt: 0,
              }
              let token = qs.stringify(data)
              res.send({
                status: 200,
                msg: '注册成功',
                token,
              })
              deleteCode(tel, false)
            })
          })
        })
      } else {
        return res.cc('验证码错误', 401)
      }
    } else {
      return res.cc('验证码错误', 401)
    }
  })
}
exports.lose = (req, res) => {
  const type = req.body.type
  let username
  let password
  let tel
  let code
  switch (type) {
    case 'findUsername':
      username = req.body.username
      // 从数据库中找username 返回结果
      const selectUsernameSql = `select * from user where username = ?`
      db.query(selectUsernameSql, [username], (err, result) => {
        if (err) return res.cc(err)
        if (result.length !== 1) {
          return res.cc('账号不存在', 401)
        } else {
          res.cc('账号找到啦', 200)
        }
      })
      break
    case 'checkCode':
      // 从 code 数据库中找code 比较 code返回结果
      tel = req.body.tel
      code = req.body.code
      username = req.body.username
      const selectTelSql = `select tel from user where username = ?`
      const selectCodeSql = `select code from tel where tel = ?`
      db.query(selectTelSql, [username], (err, result) => {
        if (err) return res.cc(err)
        if (result[0].tel === tel) {
          db.query(selectCodeSql, [tel], (err, result) => {
            if (err) return res.cc(err)
            if (result.length === 1) {
              result[0].code === code
                ? res.cc('验证码正确', 200)
                : res.cc('验证码错误', 401)
            } else {
              return res.cc('验证码错误', 401)
            }
          })
        } else {
          return res.cc('账号与手机号不匹配', 401)
        }
      })
      break
    case 'update':
      pwd = req.body.password
      tel = req.body.tel
      const updateSql = `update user set password = ? where tel = ?`
      // 修改密码
      password = bcrypt.hashSync(pwd, 10)
      db.query(updateSql, [password, tel], (err) => {
        if (err) return res.cc(err)
        deleteCode(tel, false)
        return res.send({
          status: 200,
          msg: '修改成功，请重新登录',
        })
      })
      break
    default:
      res.cc('修改失败', 401)
      break
  }
}
