exports.prefix_key = function(key, opts) {
    return opts.prefix ? opts.prefix + key : key;
}

exports.table_name = function(opts) {
    return opts.table_name || 'kvs';
}

exports.key_name = function(opts) {
    return opts.key_name || 'k';
}

exports.key_size = function(opts) {
    return opts.key_size || 32;
}

exports.value_name = function(opts) {
    return opts.value_name || 'v';
}

exports.value_size = function(opts) {
    return opts.value_size || 256;
}
