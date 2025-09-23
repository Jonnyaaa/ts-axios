import { isPlainObject } from './util'

/**
 * 规范化请求头字段名（大小写统一）
 * @param headers 请求头对象
 * @param normalizedName 要规范成的字段名（例如 'Content-Type'）
 */
function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    // 如果存在大小写不同但语义相同的 header 字段
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      // 把它改成标准化的名字
      headers[normalizedName] = headers[name]
      // 删除原来的旧 key，避免重复
      delete headers[name]
    }
  })
}

/**
 * 处理请求头逻辑：
 * 1. 规范化 Content-Type 的大小写
 * 2. 如果请求体是普通对象且未设置 Content-Type，则自动补充 application/json
 */
export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')

  // 如果请求体是一个普通对象（比如 {a: 1}）
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;chartset=utf-8'
    }
  }

  return headers
}
