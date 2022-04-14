const express = require('express')
// 创建路由对象
const router = express.Router()


// 导入 个人中心路由处理函数模块
const myHandle = require('../router_handle/my')

router.post('/getAllInfo', myHandle.getAllInfo)
router.post('/updateNickname', myHandle.updateNickname)
router.post('/saveUserAvatar', myHandle.saveUserAvatar)
router.post('/getCollect', myHandle.getCollect)
router.post('/getHoard', myHandle.getHoard)
router.post('/deleteFollowTopic', myHandle.deleteFollowTopic)
router.post('/updateTopic', myHandle.updateTopic)
router.post('/getMessage', myHandle.getMessage)
router.post('/deleteMessage', myHandle.deleteMessage)
router.post('/updateMessageOpen', myHandle.updateMessageOpen)
router.post('/getVoluntByUserid', myHandle.getVoluntByUserid)
router.post('/isAttention', myHandle.isAttention)
router.post('/addAttention', myHandle.addAttention)

// 将路由器 共享出去
module.exports = router