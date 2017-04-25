var test = require('test');
test.setup();

var kv = require('./');

var db = require('db');
var collection = require('collection');
var fs = require('fs');
var util = require('util');

var pool = require('fib-pool');

var coroutine = require('coroutine');
var rc = require('process').run;
var conf = {
    user: 'chanjet',
    password: 'd3j',
    database: 'test',
};

// The TTL should be large enough to avoid delays of operations.
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

            it('get/set', () => {
                kv_db.set('a', 'test a');
                assert.equal(kv_db.get('a'), 'test a');

                kv_db.set('b', 'test b');
                assert.equal(kv_db.get('b'), 'test b');
            });

            it('get not exists', function() {
                assert.equal(kv_db.get('a1'), null);
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

            it('cleanup/keys', function() {
                var ns = ms * 0.5 + 1;

                kv_db.set('a', 'test a');
                coroutine.sleep(ns);
                kv_db.set('b', 'test b');

                kv_db.cleanup();
                assert.equal(kv_db.keys().length, 2);

                coroutine.sleep(ns);
                kv_db.cleanup();
                assert.equal(kv_db.keys().length, 1);

                coroutine.sleep(ns);
                kv_db.cleanup();
                assert.equal(kv_db.keys().length, 0);
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

    test_kv('LruCache', {},
        () => conn = new util.LruCache(65536),
        () => conn = {});

    test_timeout('LruCache timeout', {},
        () => conn = new util.LruCache(65536, ms),
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
                timeout: ms
            },
            () => conn = db.openRedis("redis://127.0.0.1"),
            () => {
                try {
                    //conn.del('kvs');
                } catch (e) {};
                conn.close();
            });

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

            it('timeout/renew/keys/cleanup', function() {

                kv_db.set('a', 'test a');
                coroutine.sleep(1000);
                kv_db.set('b', 'test b');

                kv_db.cleanup();
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

                kv_db.cleanup();
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
                kv_db.cleanup();
                assert.equal(kv_db.keys().length, 0);
            });

        });

    }
});

process.exit(test.run(console.DEBUG));
