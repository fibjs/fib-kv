export function isMapNative () {
    return typeof Map !== 'undefined' && Object.prototype.toString.call(Map) === '[object Function]'
}