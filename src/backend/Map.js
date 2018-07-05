const { isMapNative } = require('./_utils')
const _isMapNative = isMapNative()

module.exports = {
    setup: (conn, opts) => {},
    get: (conn, opts, k) => conn.has(k) ? conn.get(k) : null,
    set: (conn, opts, k, v) => conn.set(k, v),
    has: (conn, opts, k) => conn.has(k),
    keys: (conn, opts) => Object.keys(conn.toJSON()),
    renew: (conn, opts, k) => conn.set(k, conn.get(k)),
    remove: 
        _isMapNative ? 
        (conn, opts, k) => conn.delete(k)
        :
        /**
         * that's just for old version fibjs, 
         * which has orignal module 'collection' with 'Map' Object
         * not equivalent to ES 6's Map Object
         */
        (conn, opts, k) => conn.remove(k)
};
