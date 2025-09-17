import { AxiosRequestConfig } from './types'

export default function xhr(config: AxiosRequestConfig): void {
  const { data = null, url, method = 'get' } = config // 解构
  const request = new XMLHttpRequest()

  request.open(method.toUpperCase(), url, true) // 初始化请求
  request.send(data) // 发送请求
}
