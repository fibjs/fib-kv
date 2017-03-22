var utils = require('../utils');

function getTable(conn, opts) {
    var name = utils.table_name(opts);
    return name ? conn.getHash(name) : conn;
}

module.exports = {
    setup: (conn, opts) => {},
    get: (conn, opts, k) => {
        var v = getTable(conn, opts).get(k);
        return v === null ? null : v.toString();
    },
    set: (conn, opts, k, v) => getTable(conn, opts).set(k, v),
    has: (conn, opts, k) => getTable(conn, opts).exists(k),
    remove: (conn, opts, k) => getTable(conn, opts).del(k)
};
