/// <reference path="../../@types/index.d.ts" />

export function isMapNative () {
    return typeof Map !== 'undefined' && Object.prototype.toString.call(Map) === '[object Function]'
}
