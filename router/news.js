const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入 用户路由处理函数模块
const newsHandle = require('../router_handle/news')

// 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要的验证规则对象

router.post('/list', newsHandle.newslist)
router.post('/search', newsHandle.newssearch)
router.post('/detail', newsHandle.newsdetail)
router.post('/great', newsHandle.newsLike)
router.post('/collect', newsHandle.newsCollect)
router.post('/index', newsHandle.newsIndex)

// 将路由器 共享出去
module.exports = router