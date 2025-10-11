import { AxiosInstance, AxiosRequestConfig } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'

function createInstanse(config: AxiosRequestConfig): AxiosInstance {
  const context = new Axios(config)
  // 从 Axios 原型上获取 request 方法（这是所有请求的入口方法），并通过 bind(context) 将其 this 指向 context 实例
  const instance = Axios.prototype.request.bind(context)
  // 调用 instance(config) 等价于调用 context.request(config)

  extend(instance, context)

  return instance as AxiosInstance
}

const axios = createInstanse(defaults)

export default axios
