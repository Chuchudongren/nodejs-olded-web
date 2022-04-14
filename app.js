// 导入express模块
const express = require('express')
// 创建express的服务器实例
const app = express()

// 导入解决跨域问题的 cors中间件
const cors = require('cors')
// 导入配置文件
const config = require('./config')
// 导入解析token的包
const expressJWT = require('express-jwt')

// 将cors注册为全局中间件 负责解决跨域问题
app.use(cors())
// 配置 解析 application/x-www-form-urlencoded 格式的表单数据的中间件
const parser = require('body-parser')
app.use(parser.urlencoded({ extended: false }))
// 响应数据的中间件  组件化一个处理失败的函数
app.use((req, res, next) => {
  // status = 200 为成功： status = 400 为失败  默认是失败
  res.cc = function (err, status = 400) {
    res.send({
      status,
      // 状态描述 判断 err  是错误对象还是字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

/* // 配置解析Token的中间件
// 使用 .unless({path:[/^\/api\//]}) 指定 哪些接口不需要进行 token 的身份认证
//2020年7月7日在express-jwt更新之后，安装使用express-jwt模块会默认为6.0.0版本，更新后的express-jwt需要在配置中加入algorithms属性，即设置jwt的算法。一般HS256为配置algorithms的默认值。
app.use(
  expressJWT({
    secret: config.jwtSecretKey,
    algorithms: ['HS256'],
  }).unless({ path: [/^\/user\//] })
) */

// 导入并使用 用户路由模块
const User = require('./router/user')
app.use('/user', User)

// 导入并使用 新闻路由模块
const News = require('./router/news')
app.use('/news', News)

// 导入并使用 用户评论路由模块
const Comments = require('./router/comments')
app.use('/comments', Comments)

// 导入并使用 生活路由模块
const Life = require('./router/life')
app.use('/life', Life)
// 导入并使用 健康管理路由模块
const Health = require('./router/health')
app.use('/health', Health)

// 导入并使用 论坛路由模块
const Hoard = require('./router/hoard')
app.use('/hoard', Hoard)

// 导入并使用 个人中心路由模块
const My = require('./router/my')
app.use('/my', My)

// 讲 uploads 目录中的图片托管为静态
app.use('/uploads', express.static('./uploads'))

// 在全局错误级别中间件中，捕获验证失败的错误，并把验证失败的结果响应给客户端
const joi = require('joi')
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  // 未知错误
  res.cc(err)
})

app.listen(8002, () => {
  console.log('api server running at http://127.0.0.1:8002')
})
