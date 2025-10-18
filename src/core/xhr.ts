import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'

import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  // 返回一个 Promise，类型是 AxiosPromise
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth
    } = config

    // 1. 创建 XMLHttpRequest 实例
    const request = new XMLHttpRequest()

    // 2. 初始化请求
    request.open(method.toUpperCase(), url!, true)

    // 配置request对象
    configureRequest()

    // 为request添加一些事件处理函数
    addEvents()

    // 处理请求headers
    processHeaders()

    // 处理请求取消逻辑
    processCancel()

    // 发送请求
    request.send(data)

    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }

    function addEvents(): void {
      // 监听请求状态变化
      // onreadystatechange 在请求状态变化时触发
      request.onreadystatechange = function handleLoad() {
        // readyState === 4 表示请求完成
        if (request.readyState !== 4) {
          return
        }

        // 网络异常时，status会是0
        if (request.status === 0) {
          return
        }

        // getAllResponseHeaders() 拿到原始响应头（字符串形式），再使用parseHeaders解析成对象
        const responseHeaders = parseHeaders(request.getAllResponseHeaders())
        // 根据 responseType 决定返回 response 还是 responseText
        const responseData = responseType !== 'text' ? request.response : request.responseText

        // 构造 AxiosResponse 对象
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }

        // 将响应结果传递给调用方
        handleResponse(response)
      }

      // 处理网络异常
      request.onerror = function handleError() {
        reject(createError('Network Error', config, null, request))
      }

      // 处理请求超时
      request.ontimeout = function handleTimeout() {
        reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
      }

      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    function processHeaders(): void {
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      // 判断是否需要添加 XSRF Token 到请求头
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue && xsrfHeaderName) {
          headers[xsrfHeaderName] = xsrfValue
        }
      }

      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

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
    }

    function processCancel(): void {
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          request.abort() // 取消请求
          reject(reason) // 让 axios 请求 Promise（整个请求）进入失败状态，传入取消原因
        })
      }
    }

    // 判断响应状态码
    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
