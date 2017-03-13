var util = require('util');

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

    var t = Object.prototype.toString.call(conn);
    util.extend(this, backends[t.substr(8, t.length - 9)]);
}

module.exports = kv;
