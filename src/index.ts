import { buildURL } from './helpers/url'
import { AxiosRequestConfig } from './types'
import xhr from './xhr'
import { transformRequest } from './helpers/data'

function axios(config: AxiosRequestConfig): void {
  // 拼接 URL 参数
  processConfig(config)
  xhr(config)
}

// 处理请求配置函数
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config) // 处理 query 参数
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

export default axios
