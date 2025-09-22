import { buildURL } from './helpers/url'
import { AxiosRequestConfig } from './types'
import xhr from './xhr'

function axios(config: AxiosRequestConfig): void {
  // 拼接 URL 参数
  processConfig(config)
  xhr(config)
}

// 处理请求配置函数
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
}

// URL 转换函数
function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}

export default axios
