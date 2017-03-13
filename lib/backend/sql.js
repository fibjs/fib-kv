var utils = require('../utils');

module.exports = {
    setup: function() {
        var opts = this.opts;
        var sql = 'CREATE TABLE IF NOT EXISTS ' + utils.table_name(opts) + '(' +
            utils.key_name(opts) + ' VARCHAR(' + utils.key_size(opts) + ') PRIMARY KEY, ' +
            utils.value_name(opts) + ' VARCHAR(' + utils.value_size(opts) + '));';

        this.sqls = {
            get: 'SELECT ' + utils.value_name(opts) + ' FROM ' + utils.table_name(opts) +
                ' WHERE ' + utils.key_name(opts) + ' = ?;',
            set: 'REPLACE INTO ' + utils.table_name(opts) + ' VALUES(?,?);',
            has: 'SELECT 1 FROM ' + utils.table_name(opts) + ' WHERE ' +
                utils.key_name(opts) + ' = ?;',
            remove: 'DELETE FROM ' + utils.table_name(opts) + ' WHERE ' +
                utils.key_name(opts) + ' = ?;',
        }

        this.conn.execute(sql);
    },
    get: function(k) {
        var rs = this.conn.execute(this.sqls.get, utils.prefix_key(k, this.opts));
        return rs.length ? rs[0][0] : null;
    },
    set: function(k, v) {
        this.conn.execute(this.sqls.set, utils.prefix_key(k, this.opts), v);
    },
    has: function(k) {
        return this.conn.execute(this.sqls.has, utils.prefix_key(k, this.opts)).length > 0;
    },
    remove: function(k) {
        this.conn.execute(this.sqls.remove, utils.prefix_key(k, this.opts));
    }
};
