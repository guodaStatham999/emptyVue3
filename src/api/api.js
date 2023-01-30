import axios from 'axios'

const service = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? '/apiDev' : 'http://172.16.11.130:30000/ai',
    withCredentials: false, // send cookies when cross-domain requests
    timeout: 60000 // request timeout
})

// response interceptor
service.interceptors.request.use(function (config) {
    // 发送请求之前做写什么
    return config
}, function (error) {
    // 请求错误的时候做些什么
    return Promise.reject(error)
})

// 添加响应拦截器
service.interceptors.response.use(function (response) {

    return response
}, function (error) {

    // 对响应错误做点什么
    return Promise.reject(error)
})

export default service