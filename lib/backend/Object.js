module.exports = {
    setup: (conn, opts) => {},
    get: (conn, opts, k) => {
        var v = conn[k];
        return v === undefined ? null : v;
    },
    set: (conn, opts, k, v) => conn[k] = v,
    has: (conn, opts, k) => conn.hasOwnProperty(k),
    keys: (conn, opts) => {},
    renew: (conn, opts) => {},
    remove: (conn, opts, k) => delete conn[k],
    cleanup: (conn, opts) => {},
};
