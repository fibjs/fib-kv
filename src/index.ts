/// <reference path="../@types/index.d.ts" />

var util = require('util');
var utils = require('./utils');
var backendUtils = require('./backend/_utils')

var backends = {
    Object: require('./backend/Object'),
    Map: require('./backend/Map'),
    LruCache: require('./backend/LruCache'),
    LevelDB: require('./backend/LevelDB'),
    MongoDB: require('./backend/MongoDB'),
    Redis: require('./backend/Redis'),
    SQLite: require('./backend/sql'),
    MySQL: require('./backend/sql')
};

function backend(conn) {
    var t = Object.prototype.toString.call(conn);
    var type = t.substr(8, t.length - 9)
    if (backendUtils.isMapNative() && conn instanceof Map) {
        type = 'Map'
    }

    var _back = backends[type];
    return _back || conn._back || conn;
}

function FibKV(conn, opts: FibKV.FibKVOptions = {}) {
    var cache;
    if (opts.cache) {
        cache = new util.LruCache(utils.cache_size(opts),
            utils.cache_timeout(opts));
        cache.keys = () => Object.keys(cache.toJSON());
        cache.renew = k => cache.set(k, cache.get(k));
    }

    if (typeof conn === 'function') {
        util.extend(this, {
            setup: () => conn(utils.pool_name(opts), c => backend(c).setup(c, opts)),
            get: k => conn(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                return cache ? cache.get(k, k => backend(c).get(c, opts, k)) :
                    backend(c).get(c, opts, k);
            }),
            set: (k, v) => conn(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.set(k, v);
                backend(c).set(c, opts, k, v);
            }),
            has: k => conn(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                return cache ? (cache.has(k) || backend(c).has(c, opts, k)) :
                    backend(c).has(c, opts, k);
            }),
            keys: () => conn(utils.pool_name(opts), c => backend(c).keys(c, opts)),
            renew: k => conn(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.renew(k);
                backend(c).renew(c, opts, k);
            }),
            remove: k => conn(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.remove(k);
                backend(c).remove(c, opts, k);
            }),
            cache_has: k => cache && cache.has(utils.prefix_key(k, opts)),
            cache_clear: () => cache && cache.clear()
        });
    } else {
        var _back = backend(conn);

        util.extend(this, {
            setup: () => {
                _back.setup(conn, opts);
            },
            get: k => {
                k = utils.prefix_key(k, opts);
                return cache ? cache.get(k, k => _back.get(conn, opts, k)) : _back.get(conn, opts, k);
            },
            set: (k, v) => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.set(k, v);
                _back.set(conn, opts, k, v);
            },
            has: k => {
                k = utils.prefix_key(k, opts);
                return cache ? (cache.has(k) || _back.has(conn, opts, k)) : _back.has(conn, opts, k);
            },
            keys: () => _back.keys(conn, opts),
            renew: k => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.renew(k);
                _back.renew(conn, opts, k);
            },
            remove: k => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.remove(k);
                _back.remove(conn, opts, k);
            },
            cache_has: k => cache && cache.has(utils.prefix_key(k, opts)),
            cache_clear: () => cache && cache.clear()
        });
    }
}

export = FibKV;
