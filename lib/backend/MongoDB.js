var utils = require('../utils');

module.exports = {
    setup: function() {
        var opts = this.opts;

        this.table = this.conn.getCollection(utils.table_name(opts));

        var query = {};
        query[utils.key_name(opts)] = 1;

        this.projection = {};
        this.projection[utils.value_name(opts)] = 1;

        this.table.ensureIndex(query);
    },
    get: function(k) {
        var opts = this.opts;
        var query = {};
        query[utils.key_name(opts)] = utils.prefix_key(k, this.opts);

        var r = this.table.findOne(query, this.projection);
        return r == null ? null : r[utils.value_name(opts)]
    },
    set: function(k, v) {
        var opts = this.opts;
        var query = {};
        query[utils.key_name(opts)] = utils.prefix_key(k, this.opts);

        var doc = {};
        doc[utils.value_name(opts)] = v;

        this.table.update(query, { $set: doc }, true);
    },
    has: function(k) {
        var opts = this.opts;
        var query = {};
        query[utils.key_name(opts)] = utils.prefix_key(k, this.opts);

        return this.table.find(query).hasNext();
    },
    remove: function(k) {
        var opts = this.opts;
        var query = {};
        query[utils.key_name(opts)] = utils.prefix_key(k, this.opts);

        this.table.remove(query);
    }
};
