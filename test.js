var util = require('util');
var test = require('test');
test.setup();

var kv = require('./');

var db = require('db');
var collection = {}
try {
    // very old version
    collection = require('collection')
} catch (e) {
    console.warn('no orignal module collection')
    // new version
    collection = {
        Map: Map
    }
}

var fs = require('fs');
var path = require('path');
var util = require('util');

var pool = require('fib-pool');

var coroutine = require('coroutine');
var rc = require('process').run;

var localCfg = {};
var localCfgFilename = './config.local.js'
var localCfgPath = path.resolve(__dirname, localCfgFilename)
if (fs.exists(localCfgPath)) {
    try {
        localCfg = require('./config.local')
        // JSON.parse(fs.readTextFile())
    } catch (e) {
        console.log('require local config file failure', e)
        localCfg = {}
    }
}
var conf = util.extend({
    user: 'username',
    password: 'password',
    database: 'test',
}, localCfg);

// The TTL should be large enough considering delays of operations.
var ms = 500; // 500 milliseconds

describe("kv", () => {
    var conn;

    function test_kv(name, opts, _before, _after) {
        describe(name, () => {
            var kv_db;

            before(_before);
            after(_after);

            it('setup', () => {
                kv_db = new kv(conn, opts);
                kv_db.setup();
            });

            if (['BLOB', 'LONGBLOB', 'MEDIUMBLOB', 'TINYBLOB'].includes(opts.sql_value_type)) {

                oit('blob', function () {
                    kv_db = new kv(conn, opts);
                    kv_db.setup();

                    kv_db.set('a', 'test a');
                    assert.isTrue(
                        util.isBuffer(kv_db.get('a'))
                    )
                    assert.deepEqual(kv_db.get('a'), new Buffer('test a'));
                    assert.equal(kv_db.get('a'), 'test a');
                })
            }

            it('get/set', () => {
                kv_db.set('a', 'test a');
                assert.equal(kv_db.get('a'), 'test a');

                kv_db.set('b', 'test b');
                assert.equal(kv_db.get('b'), 'test b');
            });

            it('get not exists', function() {
                assert.ok(kv_db.get('none') === null, `expect ${kv_db.get('none')} to be null`);
            });

            it('set exists key', function() {
                assert.equal(kv_db.get('a'), 'test a');
                kv_db.set('a', 'test a1');
                assert.equal(kv_db.get('a'), 'test a1');
            });

            it('has', function() {
                assert.isTrue(kv_db.has('a'));
                assert.isFalse(kv_db.has('a11'));
            });

            it('remove', function() {
                assert.equal(kv_db.get('a'), 'test a1');
                kv_db.remove('a');
                assert.isFalse(kv_db.has('a'));
                assert.equal(kv_db.get('a'), null);
            });
        });
    }

    function test_timeout(name, opts, _before, _after) {
        describe(name, () => {
            var kv_db;

            before(_before);
            after(_after);

            it('setup', () => {
                kv_db = new kv(conn, opts);
                kv_db.setup();
            });

            it('timeout/renew', function() {
                var ns = ms * 0.5 + 1;

                kv_db.set('a', 'test a');
                coroutine.sleep(ns);
                assert.equal(kv_db.get('a'), 'test a');

                kv_db.renew('a');
                coroutine.sleep(ns);
                assert.equal(kv_db.get('a'), 'test a');

                coroutine.sleep(ns);
                assert.equal(kv_db.get('a'), null);
            });

            it('keys', function() {
                var ns = ms * 0.5 + 1;

                kv_db.set('a', 'test a');
                coroutine.sleep(ns);
                kv_db.set('b', 'test b');

                assert.equal(kv_db.keys().length, 2);
                assert.deepEqual(kv_db.keys().sort(), ['a', 'b'].sort())

                coroutine.sleep(ns);
                assert.equal(kv_db.keys().length, 1);
                assert.deepEqual(kv_db.keys(), ['b'])

                coroutine.sleep(ns);
                assert.equal(kv_db.keys().length, 0);
                assert.deepEqual(kv_db.keys(), [])
            });
        });
    }

    test_kv('Object', {},
        () => conn = {},
        () => conn = {});

    test_kv('Object opts', {
            prefix: 'test_',
            cache: true
        },
        () => conn = {},
        () => conn = {});

    test_kv('Map', {},
        () => conn = new collection.Map(),
        () => conn = {});

    test_kv('Map opts', {
            prefix: 'test_',
            cache: true
        },
        () => conn = new collection.Map(),
        () => conn = {});

    test_kv('LevelDB', {},
        () => conn = db.openLevelDB("test.ldb"),
        () => conn.close());

    test_kv('LevelDB opts', {
            prefix: 'test_',
            cache: true
        },
        () => conn = db.openLevelDB("test.ldb"),
        () => {
            conn.close();

            try {
                fs.readdir("test.ldb").forEach((s) => {
                    fs.unlink("test.ldb" + "/" + s);
                });

                fs.rmdir("test.ldb");
            } catch (e) {};
        });

    test_kv('SQLite', {},
        () => conn = db.openSQLite("test.db"),
        () => {conn.close()
           try {
               fs.unlink("test.db");
           } catch (e) {};
        });

    test_kv('SQLite opts', {
            table_name: 'test', // default: kvs
            key_name: 'test_key', // default: k
            key_size: 32, // default: 32
            value_name: 'test_value', // default: v
            value_size: 256, // default: 256
            prefix: 'test_',
            cache: true
        },
        () => conn = db.openSQLite("test.db"),
        () => conn.close());

    test_kv('SQLite blob value', {
            table_name: 'test_blob', // default: kvs
            sql_value_type: 'BLOB' 
        },
        () => conn = db.openSQLite("test.db"),
        () => conn.close());

    test_timeout('SQLite timeout', {
            timeout: ms
        },
        () => conn = db.openSQLite("test.db"),
        () => {
            conn.close();

            try {
                fs.unlink("test.db");
            } catch (e) {};
        });

    if (process.argv.indexOf('full') >= 0) {
        test_kv('MySQL', {},
            () => conn = db.openMySQL('mysql://' + conf.user + ':' + conf.password + '@localhost/' + conf.database),
            () => {
                try {
                    conn.execute('DROP TABLE kvs;');
                } catch (e) {};
                conn.close();
            });

        test_kv('MySQL opts', {
                table_name: 'test', // default: kvs
                key_name: 'test_key', // default: k
                key_size: 32, // default: 32
                value_name: 'test_value', // default: v
                value_size: 256, // default: 256
                prefix: 'test_',
                cache: true
            },
            () => conn = db.openMySQL('mysql://' + conf.user + ':' + conf.password + '@localhost/' + conf.database),
            () => {
                try {
                    conn.execute('DROP TABLE test;');
                } catch (e) {};
                conn.close();
            });

        test_kv('MySQL opts blob', {
                table_name: 'test_blob', // default: kvs
                sql_value_type: 'BLOB'
            },
            () => conn = db.openMySQL('mysql://' + conf.user + ':' + conf.password + '@localhost/' + conf.database),
            () => {
                try {
                    conn.execute('DROP TABLE test_blob;');
                } catch (e) { };
                conn.close();
            });

        test_timeout('MySQL timeout', {
                timeout: ms
            },
            () => conn = db.openMySQL('mysql://' + conf.user + ':' + conf.password + '@localhost/' + conf.database),
            () => {
                try {
                    conn.execute('DROP TABLE kvs;');
                } catch (e) {};
                conn.close();
            });

        test_kv('MySQL pool', {},
            () => conn = pool(() => db.openMySQL('mysql://' + conf.user + ':' + conf.password + '@localhost/' + conf.database)),
            () => {
                try {
                    conn(c => c.execute('DROP TABLE kvs;'));
                } catch (e) {};
            });

        test_timeout('MySQL pool timeout', {
                timeout: ms
            },
            () => conn = pool(() => db.openMySQL('mysql://' + conf.user + ':' + conf.password + '@localhost/' + conf.database)),
            () => {
                try {
                    conn(c => c.execute('DROP TABLE kvs;'));
                } catch (e) {};
            });

        test_kv('Redis', {},
            () => conn = db.openRedis("redis://127.0.0.1"),
            () => {
                try {
                    conn.del('kvs');
                } catch (e) {};
                conn.close();
            });

        test_kv('Redis opts', {
                table_name: 'test', // default: kvs
                prefix: 'test_',
                cache: true
            },
            () => conn = db.openRedis("redis://127.0.0.1"),
            () => {
                try {
                    conn.del('test');
                } catch (e) {};
                conn.close();
            });

        test_timeout('Redis timeout', {
                table_name: '',
                timeout: ms
            },
            () => conn = db.openRedis("redis://127.0.0.1"),
            () => { conn.close(); });

        test_kv('MongoDB', {},
            () => conn = db.openMongoDB("mongodb://127.0.0.1/test"),
            () => {
                try {
                    conn.getCollection('kvs').drop();
                } catch (e) {};
                conn.close();
            });

        test_kv('MongoDB opts', {
                table_name: 'test', // default: kvs
                key_name: 'test_key', // default: k
                value_name: 'test_value', // default: v
                prefix: 'test_',
                cache: true
            },
            () => conn = db.openMongoDB("mongodb://127.0.0.1/test"),
            () => {
                try {
                    conn.getCollection('test').drop();
                } catch (e) {};
                conn.close();
            });

        describe('MongoDB timeout', () => {
            var kv_db;
            var ms = 30000; // ms should be great than 2000 here

            before(() => conn = db.openMongoDB("mongodb://127.0.0.1/test"));
            after(() => {
                try {
                    conn.getCollection('kvs').drop();
                } catch (e) {};
                conn.close();
            });

            it('setup', () => {
                var opts = { timeout: ms };
                kv_db = new kv(conn, opts);
                kv_db.setup();
            });

            it('timeout/renew/keys', function() {

                kv_db.set('a', 'test a');
                coroutine.sleep(1000);
                kv_db.set('b', 'test b');

                assert.equal(kv_db.keys().length, 2);

                var timer = ms + 60000;
                while (timer -= 1000) {
                    rc('echo', ['-ne', '\r', timer/1000, 'seconds left to timeout (1/3)    ']);
                    coroutine.sleep(1000);
                    if (!kv_db.get('a'))
                        break;
                    kv_db.renew('b');
                }
                rc('echo', ['-e', '\r', timer/1000, 'seconds left to timeout (1/3)    ']);

                assert.equal(kv_db.keys().length, 1);

                timer = ms;
                while (timer -= 1000) {
                    rc('echo', ['-ne', '\r', timer/1000, 'seconds left to timeout (2/3)    ']);
                    coroutine.sleep(1000);
                }
                rc('echo', ['-e', '\r', timer/1000, 'seconds left to timeout (2/3)    ']);
                assert.equal(kv_db.get('b'), 'test b');

                timer = 60000;
                while (timer -= 1000) {
                    rc('echo', ['-ne', '\r', timer/1000, 'seconds left to timeout (3/3)    ']);
                    coroutine.sleep(1000);
                }
                rc('echo', ['-e', '\r', timer/1000, 'seconds left to timeout (3/3)    ']);
                assert.equal(kv_db.get('b'), null);
                assert.equal(kv_db.keys().length, 0);
            });

        });

    }
});

process.exit(test.run(console.DEBUG).failed);
