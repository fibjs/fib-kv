var utils = require('../utils');

function getTable(conn, opts) {
    var name = utils.table_name(opts);
    return !name || name === 'kvs' ? conn : conn.getHash(name);
}

module.exports = {
    setup: (conn, opts) => {},
    get: (conn, opts, k) => {
        var v = getTable(conn, opts).get(k);
        return v === null ? null : v.toString();
    },
    set: (conn, opts, k, v) => {
        var name = utils.table_name(opts);
        return !name || name === 'kvs' ? conn.set(k, v, utils.timeout(opts)) : conn.getHash(name).set(k, v);
    },
    has: (conn, opts, k) => getTable(conn, opts).exists(k),
    keys: (conn, opts, k) => getTable(conn, opts).keys('*'),
    renew: (conn, opts, k) => {
        if (!(utils.timeout(opts) > 0)) return;
        var name = utils.table_name(opts);
        return !name || name === 'kvs' ? conn.expire(k, utils.timeout(opts)) : undefined;
    },
    remove: (conn, opts, k) => getTable(conn, opts).del(k),
    cleanup: (conn, opts, k) => {},
};
