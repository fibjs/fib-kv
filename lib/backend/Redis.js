var utils = require('../utils');

module.exports = {
    setup: (conn, opts) => {},
    get: (conn, opts, k) => {
        var v = conn.getHash(utils.table_name(opts)).get(k);
        return v === null ? null : v.toString();
    },
    set: (conn, opts, k, v) => conn.getHash(utils.table_name(opts)).set(k, v),
    has: (conn, opts, k) => conn.getHash(utils.table_name(opts)).exists(k),
    remove: (conn, opts, k) => conn.getHash(utils.table_name(opts)).del(k)
};
