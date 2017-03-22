exports.prefix_key = function(key, opts) {
    return opts.prefix !== undefined ? opts.prefix + key : key;
}

exports.table_name = function(opts) {
    return opts.table_name !== undefined ? opts.table_name : 'kvs';
}

exports.key_name = function(opts) {
    return opts.key_name !== undefined ? opts.key_name : 'k';
}

exports.key_size = function(opts) {
    return opts.key_size !== undefined ? opts.key_size : 32;
}

exports.value_name = function(opts) {
    return opts.value_name !== undefined ? opts.value_name : 'v';
}

exports.value_size = function(opts) {
    return opts.value_size !== undefined ? opts.value_size : 256;
}

exports.cache_size = function(opts) {
    return opts.cache_size !== undefined ? opts.cache_size : 65536;
}

exports.cache_timeout = function(opts) {
    return opts.cache_timeout !== undefined ? opts.cache_timeout : 60 * 1000;
}

exports.pool_name = function(opts) {
    return opts.pool_name !== undefined ? opts.pool_name : '';
}
