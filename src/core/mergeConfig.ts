import { isPlainObject, deepMerge } from '../helpers/util'
import { AxiosRequestConfig } from '../types'

const strats = Object.create(null)

// 默认策略，后者有值，取后者的值，否则取前者的值
function defaultStrat(val1: any, val2: any): any {
  return typeof val2 != 'undefined' ? val2 : val1
}

// 这些属性只能用后者的值
function fromVal2Strat(val1: any, val2: any): any {
  if (typeof val2 != 'undefined') {
    return val2
  }
}

// 这些属性需要深度合并
function deepMergeStrat(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    // 如果后者是对象，就递归合并，只有对象才需要递归合并
    return deepMerge(val1, val2)
  } else if (typeof val2 != 'undefined') {
    // 如果后者不是对象，但有值，就直接用后者的值
    return val2
  } else if (isPlainObject(val1)) {
    // 如果后者没有值，但前者是对象，
    // 注意：调用 deepMerge(val1) 实际相当于 deepMerge({}, val1)，
    // 会创建 val1 的深拷贝副本，而不是直接返回原引用
    // 这样可以防止val1与合并后的对象互相影响
    return deepMerge(val1)
  } else if (typeof val1 != 'undefined') {
    // 如果前者不是对象，但有值
    return val1
  }
}

const stratKeysFromVal2 = ['url', 'params', 'data']

stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})

const stratKeysDeepMerge = ['headers', 'auth']

stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) {
    config2 = {}
  }

  const config = Object.create(null)

  for (let key in config2) {
    mergeField(key)
  }

  for (let key in config1) {
    // 只合并config1中有，config2中没有的属性
    if (!config2[key]) {
      mergeField(key)
    }
  }

  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat // strat是一个函数
    config[key] = strat(config1[key], config2![key])
    // 使用非空断言，虽然前面设置了config2 = {}，但是ts无法识别，因为config2是函数参数
  }

  return config
}
