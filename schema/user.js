// 表单数据验证
// 用户信息验证规则模块
const joi = require('joi')
/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大程度
 * required() 值 是必填项，不能为undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 * */
// 用户名的验证规则
const username = joi.string().alphanum().min(6).max(12).required()
// 密码的验证规则    6-12位非空白符字符
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required()
// 手机号的验证规则
const tel = joi
  .string()
  .pattern(
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
  )
  .required()
const code = joi
  .string()
  .pattern(/^[0-9]{5}$/)
  .required()

// 账号密码登录表单的验证规则对象
exports.username_login_schema = {
  body: {
    username,
    password,
  },
}
// 验证码登录表单的验证规则对象
exports.tel_login_schema = {
  body: {
    tel,
    code,
  },
}
// 注册表单的验证规则对象
// 找回密码的表单的验证规则对象
exports.register_schema = {
  body: {
    username,
    password,
    tel,
    code,
  },
}
// 获取验证码表单的验证规则对象
exports.getCode_schema = {
  body: {
    tel,
  },
}
