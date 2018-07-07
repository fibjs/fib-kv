const SqlValueTypes = {
    'TINYBLOB': true,
    'BLOB': true,
    'MEDIUMBLOB': true,
    'LONGBLOB': true,
    'TINYTEXT': true,
    'TEXT': true,
    'MEDIUMTEXT': true,
    'LONGTEXT': true,
    'VARCHAR': true
};
module.exports = {
    prefix_key: (key, opts) => opts.prefix !== undefined ? opts.prefix + key : key,
    timeout: (opts) => opts.timeout !== undefined ? opts.timeout : 0,
    key_name: (opts) => opts.key_name !== undefined ? opts.key_name : 'k',
    key_size: (opts) => opts.key_size !== undefined ? opts.key_size : 32,
    pool_name: (opts) => opts.pool_name !== undefined ? opts.pool_name : '',
    table_name: (opts) => opts.table_name !== undefined ? opts.table_name : 'kvs',
    value_name: (opts) => opts.value_name !== undefined ? opts.value_name : 'v',
    value_size: (opts) => opts.value_size !== undefined ? opts.value_size : 256,
    cache_size: (opts) => opts.cache_size !== undefined ? opts.cache_size : 65536,
    cache_timeout: (opts) => opts.cache_timeout !== undefined ? opts.cache_timeout : 60 * 1000,
    cleanup_interval: (opts) => opts.cleanup_interval !== undefined ? opts.cleanup_interval : 60 * 1000,
    sql_value_type: (opts) => opts.sql_value_type && SqlValueTypes[opts.sql_value_type] ? opts.sql_value_type : 'VARCHAR'
};
