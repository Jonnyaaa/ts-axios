import { Canceler, CancelExecutor, CancelTokenSource } from '../types'
import Cancel from './Cancel' // 引入 Cancel 类，既可以作为类型使用，也可以创建实例

interface ResolvePromise {
  (reason: Cancel): void
}

export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise

    this.promise = new Promise<Cancel>(resolve => {
      // 保存 resolve 方法以便后续调用
      resolvePromise = resolve
    })

    executor(message => {
      // 防止重复调用取消函数
      if (this.reason) {
        return
      }
      this.reason = new Cancel(message)
      // 相当于调用resolve，把上面的 Promise 从 pending → fulfilled，并携带取消原因
      resolvePromise(this.reason)
    })
  }

  // 如果请求已经被取消了，就抛出 Cancel 实例
  throwIfRequested() {
    if (this.reason) {
      throw this.reason
    }
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler // 使用非空断言，我们知道cancel会被赋值
    // 异步获取cancel函数，创建 CancelToken 实例 token
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel, // 不使用非空断言，会报错，ts认为cancel可能未赋值
      token
    }
  }
}
