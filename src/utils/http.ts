/* 
添加拦截器
拦截 request 请求
拦截 uploadfile 文件上传

1,非 http 开头的需要拼接地址
2,请求超时
3,添加小程序请求标志
4,添加token 请求头标志

*/

import { useMemberStore } from '@/stores'

const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'
// 添加拦截器
const httpInterceptor = {
  //拦截前触发
  invoke(options: UniApp.RequestOptions) {
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    options.timeout = 10000
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    // 添加token
    const memberStore = useMemberStore()
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
    console.log(options)
  },
}
//添加拦截器
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)
// 添加类型，支持泛型
interface Data<T> {
  code: string
  msg: string
  resulte: T
}
// 2.2 添加类型，支持泛型
/**
 * 请求函数
 * @param options
 * @return Promise
 */

export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      //响应成功
      success(res) {
        //状态码 2xx ,数据才有
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as Data<T>)
        } else if (res.statusCode === 401) {
          //401 错误,清理用户信息,跳转登录页
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          //其他错误
          uni.showToast({
            icon: 'none',
            title: (res.data as Data<T>).msg || '请求错误',
          })
        }
      },
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误,换个网络试试',
        })
        reject(err)
      },
    })
  })
}
