import FibKVNS from '../../'
import utils = require('../utils');

function _v(opts: FibKVNS.FibKVOptions, value) {
    return utils.timeout(opts) > 0 ? value : '';
}

function exec(conn, sql: string, arg0?: any, arg1?: any, arg2?: any) {
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
            get: `SELECT ${utils.value_name(opts)} FROM ${utils.table_name(opts)} WHERE ${utils.key_name(opts)} = ?${_v(opts, ` and _timestamp >= ?`)};`,
            set: `REPLACE INTO ${utils.table_name(opts)} VALUES(?,?${_v(opts, `,?`)});`,
            has: `SELECT 1 FROM ${utils.table_name(opts)} WHERE ` +
                `${utils.key_name(opts)} = ?${_v(opts, ` and _timestamp >= ?`)};`,
            keys: `SELECT ${utils.key_name(opts)} FROM ${utils.table_name(opts)}${_v(opts, ` WHERE _timestamp >= ?`)};`,
            renew: `UPDATE ${utils.table_name(opts)} SET _timestamp = ? WHERE ${utils.key_name(opts)} = ?;`,
            remove: `DELETE FROM ${utils.table_name(opts)} WHERE ${utils.key_name(opts)} = ?;`,
            cleanup: `DELETE FROM ${utils.table_name(opts)} WHERE _timestamp < ?;`,
        }

    return sqls[method];
}

module.exports = {
    setup: (conn, opts: FibKVNS.FibKVOptions) => {
        var _sql = `CREATE TABLE IF NOT EXISTS ${utils.table_name(opts)}(` +
            `${utils.key_name(opts)} VARCHAR(${utils.key_size(opts)}) PRIMARY KEY, ` +
            `${utils.value_name(opts)} ${utils.sql_value_type(opts)}(${utils.value_size(opts)})` +
            `${_v(opts, ', _timestamp BIGINT')});`;

        conn.execute(_sql);

        if (utils.timeout(opts) > 0) {
            var _mark = setInterval(()=>{
                try {
                    conn.execute(sql(opts, 'cleanup'), Date.now() - utils.timeout(opts));
                } catch(e) {
                    // 'Error: Invalid procedure call' arises when the connection is closed
                    clearInterval(_mark);
                }
            }, utils.cleanup_interval(opts));
        }
    },
    get: (conn, opts: FibKVNS.FibKVOptions, k: string) => {
        var rs = exec(conn, sql(opts, 'get'), k,
                      utils.timeout(opts) > 0 ? Date.now() - utils.timeout(opts) : undefined);
        return rs.length ? rs[0][utils.value_name(opts)] : null;
    },
    set: (conn, opts: FibKVNS.FibKVOptions, k: string, v) => exec(conn, sql(opts, 'set'), k, v,
                                    utils.timeout(opts) > 0 ? Date.now() : undefined),
    has: (conn, opts: FibKVNS.FibKVOptions, k: string) => exec(conn, sql(opts, 'has'), k,
                                 utils.timeout(opts) > 0 ? Date.now() - utils.timeout(opts) : undefined).length > 0,
    keys: (conn, opts: FibKVNS.FibKVOptions) => {
        var _keys = exec(
            conn, sql(opts, 'keys'),
            utils.timeout(opts) > 0 ? Date.now() - utils.timeout(opts) : undefined
        ).reduce((a, b) => a.concat(b instanceof Array ? b[0] : b[utils.key_name(opts)]), [])

        return _keys
    },
    renew: (conn, opts: FibKVNS.FibKVOptions, k: string) => utils.timeout(opts) > 0 ?
        conn.execute(sql(opts, 'renew'), Date.now(), k) : undefined,
    remove: (conn, opts: FibKVNS.FibKVOptions, k: string) => conn.execute(sql(opts, 'remove'), k),
};
