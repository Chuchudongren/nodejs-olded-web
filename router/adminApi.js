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

// 将路由器 共享出去
module.exports = router