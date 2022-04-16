const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入 新闻资讯路由处理函数模块
const newsHandle = require('../router_handle/news')

router.post('/list', newsHandle.newslist)
router.post('/search', newsHandle.newssearch)
router.post('/detail', newsHandle.newsdetail)
router.post('/great', newsHandle.newsLike)
router.post('/collect', newsHandle.newsCollect)
router.post('/index', newsHandle.newsIndex)

// 将路由器 共享出去
module.exports = router