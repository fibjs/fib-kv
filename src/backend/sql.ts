/// <reference path="../../@types/index.d.ts" />

import utils = require('../utils');

function _v(opts: FibKV.FibKVOptions, value: any) {
    return utils.timeout(opts) > 0 ? value : '';
}

function exec(conn: FibKV.SqlConnection, sql: string, arg0?: any, arg1?: any, arg2?: any) {
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

function sql(conn, opts: FibKV.FibKVOptions & {
    sqls?: Record<string, string>
}, method: string) {
    var sqls = opts.sqls;

    if (!sqls)
        sqls = opts.sqls = {
            get: `SELECT ${utils.value_name(opts)} FROM ${utils.table_name(opts)} WHERE ${utils.key_name(opts)} = ?${_v(opts, ` and _timestamp >= ?`)};`,
            set: conn.type === 'psql' ?
                `INSERT INTO ${utils.table_name(opts)} (${utils.key_name(opts)}, ${utils.value_name(opts)}${_v(opts, `, _timestamp`)}) 
                VALUES (?, ?${_v(opts, `, ?`)}) 
                ON CONFLICT (${utils.key_name(opts)}) DO UPDATE 
                SET ${utils.value_name(opts)} = excluded.${utils.value_name(opts)}${_v(opts, `, _timestamp = excluded._timestamp`)};`
                : `REPLACE INTO ${utils.table_name(opts)} VALUES(?,?${_v(opts, `,?`)});`,
            has: `SELECT 1 FROM ${utils.table_name(opts)} WHERE ` +
                `${utils.key_name(opts)} = ?${_v(opts, ` and _timestamp >= ?`)};`,
            keys: `SELECT ${utils.key_name(opts)} FROM ${utils.table_name(opts)}${_v(opts, ` WHERE _timestamp >= ?`)};`,
            renew: `UPDATE ${utils.table_name(opts)} SET _timestamp = ? WHERE ${utils.key_name(opts)} = ?;`,
            remove: `DELETE FROM ${utils.table_name(opts)} WHERE ${utils.key_name(opts)} = ?;`,
            cleanup: `DELETE FROM ${utils.table_name(opts)} WHERE _timestamp < ?;`,
        }

    return sqls[method];
}

export = {
    setup: (conn: FibKV.SqlConnection, opts: FibKV.FibKVOptions) => {
        var _sql = `CREATE TABLE IF NOT EXISTS ${utils.table_name(opts)}(` +
            `${utils.key_name(opts)} VARCHAR(${utils.key_size(opts)}) PRIMARY KEY, ` +
            `${utils.value_name(opts)} ${utils.sql_value_type(opts)}(${utils.value_size(opts)})` +
            `${_v(opts, ', _timestamp BIGINT')});`;

        conn.execute(_sql);

        if (utils.timeout(opts) > 0) {
            var _mark = setInterval(() => {
                try {
                    conn.execute(sql(conn, opts, 'cleanup'), Date.now() - utils.timeout(opts));
                } catch (e) {
                    // 'Error: Invalid procedure call' arises when the connection is closed
                    clearInterval(_mark);
                }
            }, utils.cleanup_interval(opts));
        }
    },
    get: (conn: FibKV.SqlConnection, opts: FibKV.FibKVOptions, k: string) => {
        var rs = exec(conn, sql(conn, opts, 'get'), k,
            utils.timeout(opts) > 0 ? Date.now() - utils.timeout(opts) : undefined);
        return rs.length ? rs[0][utils.value_name(opts)] : null;
    },
    set: (conn: FibKV.SqlConnection, opts: FibKV.FibKVOptions, k: string, v) => exec(conn, sql(conn, opts, 'set'), k, v,
        utils.timeout(opts) > 0 ? Date.now() : undefined),
    has: (conn: FibKV.SqlConnection, opts: FibKV.FibKVOptions, k: string) => exec(conn, sql(conn, opts, 'has'), k,
        utils.timeout(opts) > 0 ? Date.now() - utils.timeout(opts) : undefined).length > 0,
    keys: (conn: FibKV.SqlConnection, opts: FibKV.FibKVOptions) => {
        var _keys = exec(
            conn, sql(conn, opts, 'keys'),
            utils.timeout(opts) > 0 ? Date.now() - utils.timeout(opts) : undefined
        ).reduce((a, b) => a.concat(b instanceof Array ? b[0] : b[utils.key_name(opts)]), [])

        return _keys
    },
    renew: (conn: FibKV.SqlConnection, opts: FibKV.FibKVOptions, k: string) => utils.timeout(opts) > 0 ?
        conn.execute(sql(conn, opts, 'renew'), Date.now(), k) : undefined,
    remove: (conn: FibKV.SqlConnection, opts: FibKV.FibKVOptions, k: string) => conn.execute(sql(conn, opts, 'remove'), k),
};
