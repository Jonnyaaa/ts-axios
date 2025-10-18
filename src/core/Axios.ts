import { combineURL } from '../helpers/url'
import {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  RejectedFn,
  ResolvedFn
} from '../types'
import dispatchRequest, { transformURL } from './dispatchRequest'
import InterceptorManager from './intercepetorManager'
import mergeConfig from './mergeConfig'

interface Interceptors {
  // 请求拦截器管理器
  request: InterceptorManager<AxiosRequestConfig>
  // 响应拦截器管理器
  response: InterceptorManager<AxiosResponse>
}

interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

export default class Axios {
  defaults: AxiosRequestConfig
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }
  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      // 如果 url 是字符串，说明用户传的是两个参数 → 需要手动把它放到 config.url
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      // 如果 url 不是字符串（那就是对象），说明用户传的是一个参数 → 直接当 config 用
      config = url
    }

    config = mergeConfig(this.defaults, config)

    // 创建一个“链”数组，初始包含 dispatchRequest（真正发请求的函数）
    const chain: PromiseChain<any>[] = [
      {
        resolved: dispatchRequest,
        rejected: undefined
      }
    ]

    // 1. 先插入请求拦截器
    // 因为请求拦截器要“在请求发出前”依次执行，
    // 所以后添加的拦截器应该先执行 —— 用 unshift 逆序插入到前面
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
    })

    // 2. 再插入响应拦截器
    // 响应拦截器要“在响应返回后”依次执行，
    // 所以先添加的应该先执行 —— 用 push 保持顺序
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })

    // 创建一个已 resolve 的 Promise，用于开始链式调用
    let promise = Promise.resolve(config)

    // 3. 按顺序构建 Promise 链
    // 每个拦截器的 resolved/rejected 函数都会通过 .then() 链接起来
    while (chain.length) {
      const { resolved, rejected } = chain.shift()! // 创建一个已 resolve 的 Promise，用于开始链式调用
      promise = promise.then(resolved, rejected) // 添加到 Promise 链上
    }

    return promise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  getUri(config?: AxiosRequestConfig): string {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }

  _requestMethodWithoutData(
    method: Method,
    url: string,
    config?: AxiosRequestConfig
  ): AxiosPromise {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMethodWithData(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosPromise {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
