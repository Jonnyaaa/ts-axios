const cookie = {
  // 用于读取指定名称的 Cookie 值，最终导出这个对象供其他模块使用
  read(name: string): string | null {
    // document.cookie：浏览器中存储的所有 Cookie 字符串，格式类似 key1=value1; key2=value2
    // (^|;\\s*)：匹配 “字符串开头” 或 “分号 + 任意空格”
    // (' + name + ')：匹配传入的 Cookie 名称
    // =([^;]*)：匹配 = 后面的内容，直到下一个分号 ; 为止
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
    // match[3] 是正则中第三个括号 ([^;]*) 捕获的内容，即 Cookie 的值。由于 Cookie 值通常会经过 encodeURIComponent 编码（比如包含特殊字符时），这里用 decodeURIComponent 解码后返回
    return match ? decodeURIComponent(match[3]) : null
  }
}

export default cookie
