var utils = require('../utils');

function sql(opts, method) {
    var sqls = opts.sqls;

    if (!sqls)
        sqls = opts.sqls = {
            get: 'SELECT ' + utils.value_name(opts) + ' FROM ' + utils.table_name(opts) +
                ' WHERE ' + utils.key_name(opts) + ' = ?;',
            set: 'REPLACE INTO ' + utils.table_name(opts) + ' VALUES(?,?);',
            has: 'SELECT 1 FROM ' + utils.table_name(opts) + ' WHERE ' +
                utils.key_name(opts) + ' = ?;',
            remove: 'DELETE FROM ' + utils.table_name(opts) + ' WHERE ' +
                utils.key_name(opts) + ' = ?;',
        }

    return sqls[method];
}

module.exports = {
    setup: (conn, opts) => {
        var sql = 'CREATE TABLE IF NOT EXISTS ' + utils.table_name(opts) + '(' +
            utils.key_name(opts) + ' VARCHAR(' + utils.key_size(opts) + ') PRIMARY KEY, ' +
            utils.value_name(opts) + ' VARCHAR(' + utils.value_size(opts) + '));';

        conn.execute(sql);
    },
    get: (conn, opts, k) => {
        var rs = conn.execute(sql(opts, 'get'), k);
        return rs.length ? rs[0][0] : null;
    },
    set: (conn, opts, k, v) => conn.execute(sql(opts, 'set'), k, v),
    has: (conn, opts, k) => conn.execute(sql(opts, 'has'), k).length > 0,
    remove: (conn, opts, k) => conn.execute(sql(opts, 'remove'), k)
};
