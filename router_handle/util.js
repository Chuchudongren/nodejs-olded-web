/* 
    日期处理工具
*/

exports.clearData = (str, ...arr) => {
    str.map(item => {
        arr.map(arritem => {
            item[arritem] = clearDataUtil(new Date(item[arritem]))
        })
    })
    return str
}
exports.clearDataTime = (str, ...arr) => {
    str.map(item => {
        arr.map(arritem => {
            item[arritem] = clearDataTimeUtil(new Date(item[arritem]))
        })
    })
    return str
}
const clearDataUtil = (time) => {
    let y = time.getFullYear()
    let M = time.getMonth() + 1
    M = M > 9 ? M : '0' + M
    let d = time.getDate()
    return `${y}-${M}-${d}`
}

exports.clearDataUtil = (time) => {
    let y = time.getFullYear()
    let M = time.getMonth() + 1
    M = M > 9 ? M : '0' + M
    let d = time.getDate()
    return `${y}-${M}-${d}`
}
const clearDataTimeUtil = (time) => {
    let y = time.getFullYear()
    let M = time.getMonth() + 1
    M = M > 9 ? M : '0' + M
    let d = time.getDate()
    d = d > 9 ? d : '0' + d
    let h = time.getHours()
    let m = time.getMinutes()
    m = m > 9 ? m : '0' + m
    let s = time.getSeconds()
    s = s > 9 ? s : '0' + s

    return `${y}-${M}-${d} ${h}:${m}:${s}`
}
exports.clearDataTimeUtil = (time) => {
    let y = time.getFullYear()
    let M = time.getMonth() + 1
    M = M > 9 ? M : '0' + M
    let d = time.getDate()
    let h = time.getHours()
    let m = time.getMinutes()
    m = m > 9 ? m : '0' + m
    let s = time.getSeconds()
    s = s > 9 ? s : '0' + s

    return `${y}-${M}-${d} ${h}:${m}:${s}`
}