var util = require('util');
var utils = require('./utils');

var backends = {
    Object: require('./backend/Object'),
    Map: require('./backend/Map'),
    LevelDB: require('./backend/LevelDB'),
    MongoDB: require('./backend/MongoDB'),
    Redis: require('./backend/Redis'),
    SQLite: require('./backend/sql'),
    MySQL: require('./backend/sql')
}

function kv(conn, opts) {
    this.conn = conn;
    this.opts = opts || {};

    var cache;
    if (opts.cache)
        cache = new util.LruCache(utils.cache_size(this.opts),
            utils.cache_timeout(this.opts));

    var t = Object.prototype.toString.call(conn);
    var _back = backends[t.substr(8, t.length - 9)];

    util.extend(this, {
        setup: function() {
            _back.setup.call(this);
        },
        get: function(k) {
            k = utils.prefix_key(k, this.opts);
            return cache ? cache.get(k, () => _back.get.call(this, k)) : _back.get.call(this, k);
        },
        set: function(k, v) {
            k = utils.prefix_key(k, this.opts);
            if (cache)
                cache.set(k, v);
            _back.set.call(this, k, v);
        },
        has: function(k) {
            k = utils.prefix_key(k, this.opts);
            return cache ? (cache.has(k) || _back.has.call(this, k)) : _back.has.call(this, k);
        },
        remove: function(k) {
            k = utils.prefix_key(k, this.opts);
            if (cache)
                cache.remove(k);
            _back.remove.call(this, k);
        },
        clear_cache: function() {
            if (cache)
                cache.clear();
        }
    });
}

module.exports = kv;
