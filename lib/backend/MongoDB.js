var utils = require('../utils');

function _q(opts, k) {
    var query = {};
    query[utils.key_name(opts)] = k;
    return query;
}

function _d(opts, v) {
    var doc = {};
    doc[utils.value_name(opts)] = v;
    return doc;
}

module.exports = {
    setup: (conn, opts) => {},
    get: (conn, opts, k) => {
        var r = conn.getCollection(utils.table_name(opts)).findOne(_q(opts, k), _d(opts, 1));
        return r == null ? null : r[utils.value_name(opts)]
    },
    set: (conn, opts, k, v) => conn.getCollection(utils.table_name(opts)).update(_q(opts, k), { $set: _d(opts, v) }, true),
    has: (conn, opts, k) => conn.getCollection(utils.table_name(opts)).find(_q(opts, k)).hasNext(),
    remove: (conn, opts, k) => conn.getCollection(utils.table_name(opts)).remove(_q(opts, k)),
};
