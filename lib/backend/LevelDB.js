module.exports = {
    setup: (conn, opts) => {},
    get: (conn, opts, k) => {
        var v = conn.get(k);
        return v === null ? null : v.toString();
    },
    set: (conn, opts, k, v) => conn.set(k, v),
    has: (conn, opts, k) => conn.has(k),
    remove: (conn, opts, k) => conn.remove(k)
};
