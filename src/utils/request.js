// axios 请求模块

// 引入
import axios from 'axios'
import JSONbig from 'json-bigint'
// 非组件模块 使用 需要加载
import router from '@/router'
// 非组件使用 meaasge
import { Message } from 'element-ui'

const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn',
  // 定义后端返回数据的处理 (参数data 是 后端返回的未经处理的JSON格式字符串)
  transformResponse: [function (data) {
    // Do whatever you want to transform the data
    try {
      return JSONbig.parse(data)
    } catch (err) {
      // console.log('转换失败', err)
      return data
    }
  }]
})

// 请求拦截器
request.interceptors.request.use(
  // 所有请求会经过这里
  // config 是当前请求相关的配置信息对象
  // config是可以修改的
  function (config) {
    // 可以在允许请求发送之前设置统一业务处理
    const user = JSON.parse(window.localStorage.getItem('user'))
    // 如果有登录用户信息,就统一设置token
    if (user) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    // return config后请求才会真正发出去
    return config
  },
  // 请求失败 经过这里
  function (error) {
    return Promise.reject(error)
  }
)

// 响应拦截器(处理常用公共的的响应状态码)
request.interceptors.response.use(function (response) {
  return response
}, function (error) {
  const { status } = error.response
  if (error.response && status === 401) {
    // 跳转登录页面
    // 路由跳转需要引入路由即可
    router.push('/login')
    // 清除本地存储的信息(user)
    window.localStorage.removeItem('user')
    Message.error('登录状态无效,请重新登录')
  } else if (status === 403) { // 没有操作权限
    // token未携带或过期
    Message({
      type: 'warning',
      message: '没有操作权限'
    })
  } else if (status === 400) { // 客户端参数错误
    Message('参数错误,检查参数去')
  } else if (status >= 500) { // 服务端内部错误
    Message.error('服务器崩溃,请稍后重试')
  }
})

// 导出
export default request
