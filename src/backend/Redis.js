var utils = require('../utils');

function getTable(conn, opts) {
    var name = utils.table_name(opts);
    return name ? conn.getHash(name) : conn;
}

module.exports = {
    setup: (conn, opts) => {
        if (utils.table_name(opts) && utils.timeout(opts) > 0) {
            conn.close();
            throw new Error('table_name must be "" to set timeout (TTL) for Redis');
        }
    },
    get: (conn, opts, k) => {
        var v = getTable(conn, opts).get(k);
        return v === null ? null : v.toString();
    },
    set: (conn, opts, k, v) => utils.timeout(opts) > 0 ? conn.set(k, v, utils.timeout(opts)) : getTable(conn, opts).set(k, v),
    has: (conn, opts, k) => getTable(conn, opts).exists(k),
    keys: (conn, opts, k) => getTable(conn, opts).keys('*').map(function (value) { return value.toString() }),
    renew: (conn, opts, k) => utils.timeout(opts) > 0 ? conn.expire(k, utils.timeout(opts)) : undefined,
    remove: (conn, opts, k) => getTable(conn, opts).del(k),
};
