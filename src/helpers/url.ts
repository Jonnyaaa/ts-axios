import { isDate, isPlainObject, isURLSearchParams } from './util'

interface URLOrigin {
  protocol: string
  host: string
}

// 对 URL 参数做编码处理
function encode(val: string): string {
  return (
    encodeURIComponent(val) // encodeURIComponent：浏览器提供的函数，用于对 URL 参数进行编码，encodeURIComponent(val)先把字符串做 URL 编码，返回一个字符串
      // .replace(...)：把某些字符编码再还原（更符合 URL 习惯）
      .replace(/%40/g, '@')
      .replace(/%3A/gi, ':')
      .replace(/%24/g, '$')
      .replace(/%2C/gi, ',')
      .replace(/%20/, '+') // 空格替换成+
      .replace(/%5B/gi, '[')
      .replace(/%5D/gi, ']')
  )
  // 只带g，表示全局替换，带i+g，表示忽略大小写，全局替换
}

export function buildURL(
  url: string,
  params?: any,
  paramsSerializer?: (params: any) => string
): string {
  // 如果 params 没传，直接返回原始 url
  if (!params) {
    return url
  }

  let serializedParams

  // 自定义规则优先于默认规则，特殊类型优先于普通对象
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString()
  } else {
    //parts 用来存储最终的 key=value 字符串片段
    const parts: string[] = []

    // 把 params 的所有 key 取出来，遍历执行一次回调函数
    Object.keys(params).forEach(key => {
      // Object.keys(params):返回 params 自身可枚举属性的 键名数组
      const val = params[key] // 取出 key 对应的值
      // 跳过 null 和 undefined 的参数，不放进 URL

      if (val === null || typeof val === 'undefined') {
        return
        // 只会结束当前这一次回调函数的执行，相当于 continue 的效果,forEach 不能用 return 或 break 来彻底中断循环
      }

      let values = []
      // 如果参数是数组 → 例如 tags: ['js', 'ts'] 会变成：tags[] = js & tags[]=ts。
      if (Array.isArray(val)) {
        values = val
        key += '[]'
      } else {
        // 如果不是数组 → 包装成单元素数组，统一处理
        values = [val]
      }

      // 处理每一个值
      values.forEach(val => {
        if (isDate(val)) {
          val = val.toISOString() // 如果值是 Date，转成 ISO 字符串（2025-09-17T13:30:00.000Z）
        } else if (isPlainObject(val)) {
          val = JSON.stringify(val) // 如果是普通对象（{a:1}），转成 JSON（{"a":1}）
        }
        parts.push(`${encode(key)}=${encode(val)}`)
      })
    })

    // 合并参数：把 parts 数组拼接成 a=1&b=2 这种格式
    // join把数组中的所有元素用指定的分隔符连接成一个字符串
    serializedParams = parts.join('&')
  }

  if (serializedParams) {
    const markIndex = url.indexOf('#') // 找到 # 的位置
    if (markIndex != -1) {
      // 如果原始 URL 里带有 #（哈希片段）
      url = url.slice(0, markIndex) // 表示从开头截取到 # 前面，去掉 hash 部分
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams // 如果原始 URL 已经有参数，用 & 拼接，否则用 ? 拼接
  }
  return url
}

// 判断 URL 是否为绝对路径
export function isAbsoluteURL(url: string): boolean {
  return /(^[a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

// 拼接 baseURL 与相对路径
export function combineURL(baseURL: string, relativeURL?: string): string {
  // 移除 baseURL 末尾的所有斜杠,移除相对路径开头的所有斜杠
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

// 判断给定的请求 URL 是否与当前页面同源（即协议和主机名相同）
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

// 创建一个 <a> 标签节点，用来解析 URL
// 浏览器原生的 <a> 元素在设置 href 后，会自动解析出 protocol、host 等字段
const urlParsingNode = document.createElement('a')
// 获取当前页面的源信息（协议 + 主机）:比如当前页面是 http://localhost:8080/index.html，那么 currentOrigin = { protocol: 'http:', host: 'localhost:8080' }
const currentOrigin = resolveURL(window.location.href)

function resolveURL(url: string): URLOrigin {
  // 把传入的 url 设置为这个 <a> 标签的 href 属性值
  urlParsingNode.setAttribute('href', url)
  // 获取协议+主机
  const { protocol, host } = urlParsingNode

  return {
    protocol,
    host
  }
}
