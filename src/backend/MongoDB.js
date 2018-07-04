var utils = require('../utils');

function _q(opts, k) {
    var query = {};
    query[utils.key_name(opts)] = k;
    return query;
}

function _d(opts, v) {
    var doc = {};
    doc[utils.value_name(opts)] = v;
    if (utils.timeout(opts) > 0) doc._timestamp = new Date();
    return doc;
}

module.exports = {
    setup: (conn, opts) => {
        if (!(utils.timeout(opts) > 0)) return;

        conn.getCollection(utils.table_name(opts)).ensureIndex({
            _timestamp: 1
        }, {
            expireAfterSeconds: utils.timeout(opts) / 1000
        });
    },
    get: (conn, opts, k) => {
        var r = conn.getCollection(utils.table_name(opts)).findOne(_q(opts, k), _d(opts, 1));
        return r == null ? null : r[utils.value_name(opts)]
    },
    set: (conn, opts, k, v) => conn.getCollection(utils.table_name(opts)).update(_q(opts, k), {
        $set: _d(opts, v)
    }, true),
    has: (conn, opts, k) => conn.getCollection(utils.table_name(opts)).find(_q(opts, k)).hasNext(),
    keys: (conn, opts, k) => conn.getCollection(utils.table_name(opts)).find(_q(opts, k)).toArray().reduce((a, b) => a.concat(b[utils.key_name(opts)]), []),
    renew: (conn, opts, k) => {
        if (!(utils.timeout(opts) > 0)) return;
        var mass = conn.getCollection(utils.table_name(opts));
        var r = mass.findOne(_q(opts, k), _d(opts, 1));
        return r === null ? false : mass.update(_q(opts, k), {
            $set: _d(opts, r[utils.value_name(opts)])
        });
    },
    remove: (conn, opts, k) => conn.getCollection(utils.table_name(opts)).remove(_q(opts, k)),
};