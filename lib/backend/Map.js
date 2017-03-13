var utils = require('../utils');

module.exports = {
    setup: function() {},
    get: function(k) {
        return this.conn.get(utils.prefix_key(k, this.opts));
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
