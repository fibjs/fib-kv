var utils = require('../utils');

module.exports = {
    setup: function() {},
    get: function(k) {
        var v = this.conn[utils.prefix_key(k, this.opts)];
        return v === undefined ? null : v;
    },
    set: function(k, v) {
        this.conn[utils.prefix_key(k, this.opts)] = v;
    },
    has: function(k) {
        return this.conn.hasOwnProperty(utils.prefix_key(k, this.opts));
    },
    remove: function(k) {
        delete this.conn[utils.prefix_key(k, this.opts)];
    }
};
