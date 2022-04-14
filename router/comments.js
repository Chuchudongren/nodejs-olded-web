const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入 用户路由处理函数模块
const commentsHandle = require('../router_handle/comments')

router.post('/news', commentsHandle.selectNewsComments)
router.post('/addComment', commentsHandle.newsAddComment)

// 将路由器 共享出去
module.exports = router