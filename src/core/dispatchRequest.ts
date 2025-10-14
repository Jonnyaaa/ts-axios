// 用于统一处理请求配置并发送真正的 HTTP 请求，是 Axios 请求流程的核心桥梁
import { buildURL } from '../helpers/url'
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { flattenHeaders } from '../helpers/headers'
import transform from './transform'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 发送请求前，检查是否已经被取消
  throwIfCancellationRequested(config)
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
  config.data = transform(config.data, config.headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!) // 扁平化
}

// URL 转换函数
function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url!, params)
}

// 处理响应数据函数
function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

// 如果cancelToken存在且已经被使用，就抛出异常中断请求
function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
