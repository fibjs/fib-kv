var utils = require('../utils');

module.exports = {
    setup: function() {},
    get: function(k) {
        var v = this.conn.get(utils.prefix_key(k, this.opts));
        return v === null ? null : v.toString();
    },
    set: function(k, v) {
        this.conn.set(utils.prefix_key(k, this.opts), v);
    },
    has: function(k) {
        return this.conn.has(utils.prefix_key(k, this.opts));
    },
    remove: function(k) {
        this.conn.remove(utils.prefix_key(k, this.opts));
    }
};
