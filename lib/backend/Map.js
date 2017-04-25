module.exports = {
    setup: (conn, opts) => {},
    get: (conn, opts, k) => conn.get(k),
    set: (conn, opts, k, v) => conn.set(k, v),
    has: (conn, opts, k) => conn.has(k),
    keys: (conn, opts) => Object.keys(conn.toJSON()),
    renew: (conn, opts, k) => conn.set(k, conn.get(k)),
    remove: (conn, opts, k) => conn.remove(k),
    cleanup: (conn, opts) => {},
};
