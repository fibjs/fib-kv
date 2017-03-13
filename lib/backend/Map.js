module.exports = {
    setup: function() {},
    get: function(k) {
        return this.conn.get(k);
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
