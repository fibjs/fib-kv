Object.defineProperty(exports, "__esModule", { value: true });
function isMapNative() {
    return typeof Map !== 'undefined' && Object.prototype.toString.call(Map) === '[object Function]';
}
exports.isMapNative = isMapNative;
