import { AxiosRequestConfig } from './types'

export default function xhr(config: AxiosRequestConfig): void {
  const { data = null, url, method = 'get', headers } = config // 解构
  const request = new XMLHttpRequest()

  request.open(method.toUpperCase(), url, true) // 初始化请求

  // 处理请求头
  Object.keys(headers).forEach(name => {
    // 遍历 headers 对象的所有属性名
    // 如果请求没有 body，就不需要 Content-Type
    if (data === null && name.toLowerCase() === 'content-type') {
      delete headers[name]
    } else {
      request.setRequestHeader(name, headers[name])
    }
  })

  request.send(data) // 发送请求
}
