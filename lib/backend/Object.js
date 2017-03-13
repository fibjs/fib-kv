module.exports = {
    setup: function() {},
    get: function(k) {
        var v = this.conn[k];
        return v === undefined ? null : v;
    },
    set: function(k, v) {
        this.conn[k] = v;
    },
    has: function(k) {
        return this.conn.hasOwnProperty(k);
    },
    remove: function(k) {
        delete this.conn[k];
    }
};
