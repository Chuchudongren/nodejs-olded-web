const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入 用户路由处理函数模块
const userHandle = require('../router_handle/user')

// 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要的验证规则对象
const {
  username_login_schema,
  tel_login_schema,
  register_schema,
  getCode_schema,
} = require('../schema/user')

router.post(
  '/login/username',
  expressJoi(username_login_schema),
  userHandle.usernameLogin
)
router.post('/login/tel', expressJoi(tel_login_schema), userHandle.telLogin)
router.post('/getCode', expressJoi(getCode_schema), userHandle.getCode)
router.post('/register', expressJoi(register_schema), userHandle.register)
router.post('/lose', userHandle.lose)
// 将路由器 共享出去
module.exports = router
