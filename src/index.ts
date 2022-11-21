/// <reference path="../@types/index.d.ts" />

import util = require('util');
import utils = require('./utils');
import backendUtils = require('./backend/_utils')

const backends = {
    Object: require('./backend/Object'),
    Map: require('./backend/Map'),
    LruCache: require('./backend/LruCache'),
    LevelDB: require('./backend/LevelDB'),
    MongoDB: require('./backend/MongoDB'),
    Redis: require('./backend/Redis'),
    SQLite: require('./backend/sql'),
    MySQL: require('./backend/sql')
};

function backend(conn: FibKV.IConnection) {
    if ((conn as any).custom_backend) return (conn as any).custom_backend;

    const t = Object.prototype.toString.call(conn);
    let type = t.substr(8, t.length - 9)
    if (backendUtils.isMapNative() && conn instanceof Map) {
        type = 'Map'
    }

    const _back = backends[type];
    return _back || (conn as any)._back || conn;
}

interface Cache extends Class_LruCache {
    keys(): string[];
    renew(k: string): any;
    [k: string]: any
}
const FibKV = function (
    this: FibKV.FibKVInstance,
    conn: FibKV.IConnection | FibPoolNS.FibPool<FibKV.IConnection>, opts: FibKV.FibKVOptions = {}
) {
    let cache: Cache;
    if (opts.cache) {
        cache = <Cache>new util.LruCache(utils.cache_size(opts), utils.cache_timeout(opts));
        cache.keys = () => Object.keys(cache.toJSON());
        cache.renew = (k) => cache.set(k, cache.get(k));
    }

    // fib-pool
    if (typeof conn === 'function') {
        const pool = conn as FibPoolNS.FibPool<FibKV.IConnection>
        util.extend(this, {
            setup: () => pool(utils.pool_name(opts), c => backend(c).setup(c, opts)),
            get: k => pool(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                return cache ? cache.get(k, (k: string) => backend(c).get(c, opts, k)) :
                    backend(c).get(c, opts, k);
            }),
            set: (k, v) => pool(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.set(k, v);
                backend(c).set(c, opts, k, v);
            }),
            has: k => pool(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                return cache ? (cache.has(k) || backend(c).has(c, opts, k)) :
                    backend(c).has(c, opts, k);
            }),
            keys: () => pool(utils.pool_name(opts), c => backend(c).keys(c, opts)),
            renew: k => pool(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.renew(k);
                backend(c).renew(c, opts, k);
            }),
            remove: k => pool(utils.pool_name(opts), c => {
                k = utils.prefix_key(k, opts);
                if (cache)
                    cache.remove(k);
                backend(c).remove(c, opts, k);
            }),
            cache_has: k => cache && cache.has(utils.prefix_key(k, opts)),
            cache_clear: () => cache && cache.clear()
        } as FibKV.FibKVInstance);
    } else {
        const _back = backend(conn);

        util.extend(this, {
            setup: () => {
                _back.setup(conn, opts);
            },
            get: k => {
                k = utils.prefix_key(k, opts);
                return cache ? cache.get(k, (k: string) => _back.get(conn, opts, k)) : _back.get(conn, opts, k);
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
        } as FibKV.FibKVInstance);
    }
} as any as FibKV.FibKVConstructor

export = FibKV;
