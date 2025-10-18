import { AxiosRequestConfig, AxiosStatic } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'

function createInstanse(config: AxiosRequestConfig): AxiosStatic {
  const context = new Axios(config)
  // 从 Axios 原型上获取 request 方法（这是所有请求的入口方法），并通过 bind(context) 将其 this 指向 context 实例
  const instance = Axios.prototype.request.bind(context)
  // 调用 instance(config) 等价于调用 context.request(config)

  extend(instance, context)

  return instance as AxiosStatic
}

const axios = createInstanse(defaults)

axios.create = function create(config) {
  return createInstanse(mergeConfig(defaults, config))
}

axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

axios.all = function all(promises) {
  return Promise.all(promises)
}

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr)
  }
}

axios.Axios = Axios

export default axios
