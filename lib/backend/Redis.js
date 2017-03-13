var utils = require('../utils');

module.exports = {
    setup: function() {
        this.hash = this.conn.getHash(utils.table_name(this.opts));
    },
    get: function(k) {
        var v = this.hash.get(utils.prefix_key(k, this.opts));
        return v === null ? null : v.toString();
    },
    set: function(k, v) {
        this.hash.set(utils.prefix_key(k, this.opts), v);
    },
    has: function(k) {
        return this.hash.exists(utils.prefix_key(k, this.opts));
    },
    remove: function(k) {
        this.hash.del(utils.prefix_key(k, this.opts));
    }
};
