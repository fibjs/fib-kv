var utils = require('../utils');

function _v(opts, value) {
    return utils.timeout(opts) > 0 ? value : '';
}

function exec(conn, sql, arg0, arg1, arg2) {
    var params = [sql];
    do {
        if (arg0 === undefined) break;
        params.push(arg0);
        if (arg1 === undefined) break;
        params.push(arg1);
        if (arg2 === undefined) break;
        params.push(arg2);
    } while (false);

    return conn.execute.apply(conn, params);
}

function sql(opts, method) {
    var sqls = opts.sqls;

    if (!sqls)
        sqls = opts.sqls = {
            get: 'SELECT ' + utils.value_name(opts) + ' FROM ' + utils.table_name(opts) +
                ' WHERE ' + utils.key_name(opts) + ' = ?' + _v(opts, ' and timestamp >= ?') + ';',
            set: 'REPLACE INTO ' + utils.table_name(opts) + ' VALUES(?,?' + _v(opts, ',?') + ');',
            has: 'SELECT 1 FROM ' + utils.table_name(opts) + ' WHERE ' +
                utils.key_name(opts) + ' = ?' + _v(opts, ' and timestamp >= ?') + ';',
            keys: 'SELECT ' + utils.key_name(opts) + ' FROM ' + utils.table_name(opts) + ';',
            renew: 'UPDATE ' + utils.table_name(opts) + ' SET timestamp = ? WHERE ' +
                utils.key_name(opts) + ' = ?;',
            remove: 'DELETE FROM ' + utils.table_name(opts) + ' WHERE ' +
                utils.key_name(opts) + ' = ?;',
            cleanup: 'DELETE FROM ' + utils.table_name(opts) + ' WHERE timestamp < ?;',
        }

    return sqls[method];
}

module.exports = {
    setup: (conn, opts) => {
        var sql = 'CREATE TABLE IF NOT EXISTS ' + utils.table_name(opts) + '(' +
            utils.key_name(opts) + ' VARCHAR(' + utils.key_size(opts) + ') PRIMARY KEY, ' +
            utils.value_name(opts) + ' VARCHAR(' + utils.value_size(opts) + ')' +
            _v(opts, ', timestamp BIGINT') + ');';

        conn.execute(sql);
    },
    get: (conn, opts, k) => {
        var rs = exec(conn, sql(opts, 'get'), k,
                      utils.timeout(opts) > 0 ? new Date().getTime() - utils.timeout(opts) : undefined);
        return rs.length ? rs[0][0] : null;
    },
    set: (conn, opts, k, v) => exec(conn, sql(opts, 'set'), k, v,
                                    utils.timeout(opts) > 0 ? new Date().getTime() : undefined),
    has: (conn, opts, k) => exec(conn, sql(opts, 'has'), k,
                                 utils.timeout(opts) > 0 ? new Date().getTime() - utils.timeout(opts) : undefined).length > 0,
    keys: (conn, opts) => conn.execute(sql(opts, 'keys')).reduce((a, b) => a.concat(b[0]), []),
    renew: (conn, opts, k) => utils.timeout(opts) > 0 ?
        conn.execute(sql(opts, 'renew'), new Date().getTime(), k) : undefined,
    remove: (conn, opts, k) => conn.execute(sql(opts, 'remove'), k),
    cleanup: (conn, opts) => conn.execute(sql(opts, 'cleanup'), new Date().getTime() - utils.timeout(opts)),
};
