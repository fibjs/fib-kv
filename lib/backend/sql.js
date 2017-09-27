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
                ' WHERE ' + utils.key_name(opts) + ' = ?' + _v(opts, ' and _timestamp >= ?') + ';',
            set: 'REPLACE INTO ' + utils.table_name(opts) + ' VALUES(?,?' + _v(opts, ',?') + ');',
            has: 'SELECT 1 FROM ' + utils.table_name(opts) + ' WHERE ' +
                utils.key_name(opts) + ' = ?' + _v(opts, ' and _timestamp >= ?') + ';',
            keys: 'SELECT ' + utils.key_name(opts) + ' FROM ' + utils.table_name(opts) +
                _v(opts, ' WHERE _timestamp >= ?') + ';',
            renew: 'UPDATE ' + utils.table_name(opts) + ' SET _timestamp = ? WHERE ' +
                utils.key_name(opts) + ' = ?;',
            remove: 'DELETE FROM ' + utils.table_name(opts) + ' WHERE ' +
                utils.key_name(opts) + ' = ?;',
            cleanup: 'DELETE FROM ' + utils.table_name(opts) + ' WHERE _timestamp < ?;',
        }

    return sqls[method];
}

module.exports = {
    setup: (conn, opts) => {
        var _sql = 'CREATE TABLE IF NOT EXISTS ' + utils.table_name(opts) + '(' +
            utils.key_name(opts) + ' VARCHAR(' + utils.key_size(opts) + ') PRIMARY KEY, ' +
            utils.value_name(opts) + ' VARCHAR(' + utils.value_size(opts) + ')' +
            _v(opts, ', _timestamp BIGINT') + ');';

        conn.execute(_sql);

        if (utils.timeout(opts) > 0) {
            var _mark = setInterval(()=>{
                try {
                    conn.execute(sql(opts, 'cleanup'), new Date().getTime() - utils.timeout(opts));
                } catch(e) {
                    // 'Error: Invalid procedure call' arises when the connection is closed
                    clearInterval(_mark);
                }
            }, utils.cleanup_interval(opts));
        }
    },
    get: (conn, opts, k) => {
        var rs = exec(conn, sql(opts, 'get'), k,
                      utils.timeout(opts) > 0 ? new Date().getTime() - utils.timeout(opts) : undefined);
        return rs.length ? rs[0][utils.value_name(opts)] : null;
    },
    set: (conn, opts, k, v) => exec(conn, sql(opts, 'set'), k, v,
                                    utils.timeout(opts) > 0 ? new Date().getTime() : undefined),
    has: (conn, opts, k) => exec(conn, sql(opts, 'has'), k,
                                 utils.timeout(opts) > 0 ? new Date().getTime() - utils.timeout(opts) : undefined).length > 0,
    keys: (conn, opts) => exec(conn, sql(opts, 'keys'),
                              utils.timeout(opts) > 0 ? new Date().getTime() - utils.timeout(opts) : undefined).reduce((a, b) => a.concat(b[0]), []),
    renew: (conn, opts, k) => utils.timeout(opts) > 0 ?
        conn.execute(sql(opts, 'renew'), new Date().getTime(), k) : undefined,
    remove: (conn, opts, k) => conn.execute(sql(opts, 'remove'), k),
};
