const toString = Object.prototype.toString

// 类型保护函数
export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

// export function isObject(val: any): val is Object {
//   return val !== null && typeof val === 'object' // 因为 typeof null === 'object'，所以要先排除掉 null
// }

export function isPlainObject(val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

// 判断是否为FormData
// 判断 typeof val !== 'undefined' 是为了避免在 val 未定义时，直接使用 val instanceof FormData 抛出错误
export function isFormData(val: any): val is FormData {
  return typeof val !== 'undefined' && val instanceof FormData
}

// 合并两个对象的属性
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
    // 分号 ;：独立表达式开头的分号，用于避免代码压缩或拼接时可能出现的语法歧义
  }
  return to as T & U
}

// 深度合并多个对象
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)

  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isPlainObject(val)) {
          // 如果result[key]已经是一个对象，也就是说，如果多个对象的同一个key对应的值都是对象，就会递归合并
          if (isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge(val)
          }
        } else {
          result[key] = val
        }
      })
    }
  })
  return result
}
