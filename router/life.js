const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入 生活服务路由处理函数模块
const lifeHandle = require('../router_handle/life')

router.post('/volunt/list', lifeHandle.voluntlist)
router.post('/voluntdetail', lifeHandle.voluntdetail)
router.post('/isVolunt', lifeHandle.isVolunt)
router.post('/volunt/joinin', lifeHandle.joinin)
router.post('/isCollect', lifeHandle.isCollect)
router.post('/turnCollect', lifeHandle.turnCollect)
router.get('/getvolunthot', lifeHandle.getvolunthot)
router.post('/voluntaddinfo', lifeHandle.voluntaddinfo)
router.post('/law/message', lifeHandle.lawMessage)
router.post('/getmessage', lifeHandle.getmessage)
router.get('/getdynamic', lifeHandle.getdynamic)
router.post('/lawdetail', lifeHandle.lawdetail)
router.get('/service', lifeHandle.getService)
router.post('/service/list', lifeHandle.getServiceList)
router.post('/volunt/getVoluntInfo', lifeHandle.getVoluntInfo)

// 填写数据库专用 和 程序没有关系
// router.get('/test', lifeHandle.test)
router.post('/getMp3', lifeHandle.getMp3)

// 将路由器 共享出去
module.exports = router