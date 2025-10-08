// 用于统一处理请求配置并发送真正的 HTTP 请求，是 Axios 请求流程的核心桥梁
import { buildURL } from '../helpers/url'
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { transformRequest, transformResponse } from '../helpers/data'
import { processHeaders } from '../helpers/headers'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 拼接 URL 参数
  processConfig(config)
  // 发送请求，xhr 返回 AxiosPromise（Promise<AxiosResponse>）
  return xhr(config).then(res => {
    // 对响应数据做一层转换，再返回
    return transformResponseData(res)
  })
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
  return buildURL(url!, params)
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

// 处理响应数据函数
function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transformResponse(res.data)
  return res
}
