const express = require('express')
// 创建路由对象
const router = express.Router()

const AdminHandle = require('../router_handle/adminApi')

router.post('/login', AdminHandle.login)
router.post('/getRoleRights', AdminHandle.getRoleRights)
router.get('/user', AdminHandle.user)
router.post('/changeRoleById', AdminHandle.changeRoleById)
router.post('/disabledUser', AdminHandle.disabledUser)
router.post('/addAdmin', AdminHandle.addAdmin)
router.get('/getNewsList', AdminHandle.getNewsList)
router.post('/deleteNewsByid', AdminHandle.deleteNewsByid)
router.post('/setHotNews', AdminHandle.setHotNews)
router.get('/getCategory', AdminHandle.getCategory)
router.post('/addNews', AdminHandle.addNews)
router.post('/getNewsById', AdminHandle.getNewsById)
router.get('/getVoluntLIst', AdminHandle.getVoluntLIst)
router.post('/deleteVoluntById', AdminHandle.deleteVoluntById)
router.post('/setHotVolunt', AdminHandle.setHotVolunt)
router.post('/setVoluntStatus', AdminHandle.setVoluntStatus)
router.post('/getVoluntById', AdminHandle.getVoluntById)
router.post('/addVolunt', AdminHandle.addVolunt)
router.get('/getVoluntUserList', AdminHandle.getVoluntUserList)
router.post('/deleteVoluntUserByUserid', AdminHandle.deleteVoluntUserByUserid)
router.post('/setUserIsvolunt', AdminHandle.setUserIsvolunt)

// 将路由器 共享出去
module.exports = router