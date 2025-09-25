import { buildURL } from './helpers/url'
import { AxiosRequestConfig, AxiosPromise } from './types'
import xhr from './xhr'
import { transformRequest } from './helpers/data'
import { processHeaders } from './helpers/headers'

function axios(config: AxiosRequestConfig): AxiosPromise {
  // 拼接 URL 参数
  processConfig(config)
  return xhr(config)
  // 返回 AxiosPromise，这样外部可以用 then 拿到响应对象
}

// 处理请求配置函数
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config) // 处理 query 参数
  config.headers = transformHeaders(config) // 处理headers，headers要放在data之前
  config.data = transformRequestData(config) // 处理 body 数据
}

// URL 转换函数
function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}

// 处理请求数据函数
function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

// 处理请求头函数
function transformHeaders(config: AxiosRequestConfig): any {
  const { headers = {}, data } = config // config.headers 可能未传，设置默认值 {}
  return processHeaders(headers, data)
}

export default axios
