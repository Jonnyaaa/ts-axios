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
