import { AxiosRequestConfig, AxiosStatic } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'

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

export default axios
