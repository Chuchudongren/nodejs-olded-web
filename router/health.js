const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入 用户路由处理函数模块
const healthHandle = require('../router_handle/health')

router.post('/getHospitalList', healthHandle.getHospitalList)
router.post('/getclinicList', healthHandle.getclinicList)
router.post('/setClinicRecord', healthHandle.setClinicRecord)
router.get('/getgameone', healthHandle.getgameone)
router.post('/getUserHistorySearch', healthHandle.getUserHistorySearch)
router.post('/addUserHistorySearch', healthHandle.addUserHistorySearch)
router.get('/getShowMsg', healthHandle.getShowMsg)
router.get('/getMsg', healthHandle.getMsg)
router.post('/getMsgDetail', healthHandle.getMsgDetail)
router.post('/getMsgForKey', healthHandle.getMsgForKey)

// 将路由器 共享出去
module.exports = router