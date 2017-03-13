var utils = require('../utils');

module.exports = {
    setup: function() {
        this.hash = this.conn.getHash(utils.table_name(this.opts));
    },
    get: function(k) {
        var v = this.hash.get(k);
        return v === null ? null : v.toString();
    },
    set: function(k, v) {
        this.hash.set(k, v);
    },
    has: function(k) {
        return this.hash.exists(k);
    },
    remove: function(k) {
        this.hash.del(k);
    }
};
