import { ResolvedFn, RejectedFn } from '../types'

// 泛型接口，用于描述单个拦截器对象
interface Interceptor<T> {
  // “成功拦截器”函数
  resolved: ResolvedFn<T>
  // “失败拦截器”函数
  rejected?: RejectedFn
}

export default class InterceptorManager<T> {
  // 存储拦截器的数组，数组中的每个元素是一个拦截器对象或 null（被删除时置为 null）
  private interceptors: Array<Interceptor<T> | null>

  constructor() {
    this.interceptors = []
  }

  // 注册一个新的拦截器
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    // 返回新拦截器的索引位置，方便外部 eject 时使用
    return this.interceptors.length - 1
  }

  // 遍历所有拦截器
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      // 如果拦截器未被删除
      if (interceptor != null) {
        // 执行外部传入的函数 fn，传入当前拦截器对象
        fn(interceptor)
      }
    })
  }

  // 根据拦截器ID移除拦截器
  eject(id: number): void {
    // 将对应拦截器置为 null（而不是直接删除），保证索引一致，避免影响其他拦截器的 id
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
