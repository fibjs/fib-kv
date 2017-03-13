module.exports = {
    setup: function() {},
    get: function(k) {
        var v = this.conn.get(k);
        return v === null ? null : v.toString();
    },
    set: function(k, v) {
        this.conn.set(k, v);
    },
    has: function(k) {
        return this.conn.has(k);
    },
    remove: function(k) {
        this.conn.remove(k);
    }
};
