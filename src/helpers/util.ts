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

// 合并两个对象的属性
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
    // 分号 ;：独立表达式开头的分号，用于避免代码压缩或拼接时可能出现的语法歧义
  }
  return to as T & U
}
