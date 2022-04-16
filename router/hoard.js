const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入 论坛路由处理函数模块
const hoardHandle = require('../router_handle/hoard')

router.post('/getTopicListByCate', hoardHandle.getTopicListByCate)
router.post('/getTopicByid', hoardHandle.getTopicByid)
router.post('/getTopicFollowByid', hoardHandle.getTopicFollowByid)
router.post('/getTopicCommentByid', hoardHandle.getTopicCommentByid)
router.get('/getHoardCate', hoardHandle.getHoardCate)
router.post('/pushTopic', hoardHandle.pushTopic)
router.post('/isStar', hoardHandle.isStar)
router.post('/setBehavior', hoardHandle.setBehavior)
router.post('/pushSonComment', hoardHandle.pushSonComment)
router.post('/pushComment', hoardHandle.pushComment)
router.post('/addHits', hoardHandle.addHits)
router.post('/pushTopicFollow', hoardHandle.pushTopicFollow)
router.post('/updateTopic', hoardHandle.updateTopic)

// 将路由器 共享出去
module.exports = router