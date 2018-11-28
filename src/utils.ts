/// <reference path="../@types/index.d.ts" />

const SqlValueTypes: { [key: string /* SQL_VALUE_TYPE */]: true } = {
    'TINYBLOB': true,
    'BLOB': true,
    'MEDIUMBLOB': true,
    'LONGBLOB': true,
    'TINYTEXT' : true,
    'TEXT': true,
    'MEDIUMTEXT': true,
    'LONGTEXT': true,
    'VARCHAR': true
}

export = {
    prefix_key: (key: string, opts: FibKV.FibKVOptions) => opts.prefix !== undefined ? opts.prefix + key : key,
    timeout: (opts: FibKV.FibKVOptions) => opts.timeout !== undefined ? opts.timeout : 0,
    key_name: (opts: FibKV.FibKVOptions) => opts.key_name !== undefined ? opts.key_name : 'k',
    key_size: (opts: FibKV.FibKVOptions) => opts.key_size !== undefined ? opts.key_size : 32,
    pool_name: (opts: FibKV.FibKVOptions) => opts.pool_name !== undefined ? opts.pool_name : '',
    table_name: (opts: FibKV.FibKVOptions) => opts.table_name !== undefined ? opts.table_name : 'kvs',
    value_name: (opts: FibKV.FibKVOptions) => opts.value_name !== undefined ? opts.value_name : 'v',
    value_size: (opts: FibKV.FibKVOptions) => opts.value_size !== undefined ? opts.value_size : 256,
    cache_size: (opts: FibKV.FibKVOptions) => opts.cache_size !== undefined ? opts.cache_size : 65536,
    cache_timeout: (opts: FibKV.FibKVOptions) => opts.cache_timeout !== undefined ? opts.cache_timeout : 60 * 1000,
    cleanup_interval: (opts: FibKV.FibKVOptions) => opts.cleanup_interval !== undefined ? opts.cleanup_interval : 60 * 1000,
    sql_value_type: (opts: FibKV.FibKVOptions) => opts.sql_value_type && SqlValueTypes[opts.sql_value_type] ? opts.sql_value_type : 'VARCHAR'
};
