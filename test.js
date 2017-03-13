var test = require('test');
test.setup();

var kv = require('./');
var db = require('db');
var collection = require('collection');
var fs = require('fs');

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

    test_kv('Object', {},
        () => conn = {},
        () => conn = {});

    test_kv('Object opts', {
            prefix: 'test_'
        },
        () => conn = {},
        () => conn = {});

    test_kv('Map', {},
        () => conn = new collection.Map(),
        () => conn = {});

    test_kv('Map opts', {
            prefix: 'test_'
        },
        () => conn = new collection.Map(),
        () => conn = {});

    test_kv('LevelDB', {},
        () => conn = db.openLevelDB("test.ldb"),
        () => conn.close());

    test_kv('LevelDB opts', {
            prefix: 'test_'
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
        () => conn.close());

    test_kv('SQLite opts', {
            table_name: 'test', // default: kvs
            key_name: 'test_key', // default: k
            key_size: 32, // default: 32
            value_name: 'test_value', // default: v
            value_size: 256, // default: 256
            prefix: 'test_'
        },
        () => conn = db.openSQLite("test.db"),
        () => {
            conn.close();

            try {
                fs.unlink("test.db");
            } catch (e) {};
        });

    test_kv('MySQL', {},
        () => conn = db.openMySQL("mysql://root@localhost/test"),
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
            prefix: 'test_'
        },
        () => conn = db.openMySQL("mysql://root@localhost/test"),
        () => {
            try {
                conn.execute('DROP TABLE test;');
            } catch (e) {};
            conn.close();
        });

    test_kv('MongoDB', {},
        () => conn = db.openMongoDB("mongodb://127.0.0.1/test"),
        () => conn.close());

    test_kv('MongoDB opts', {
            table_name: 'test', // default: kvs
            key_name: 'test_key', // default: k
            value_name: 'test_value', // default: v
            prefix: 'test_'
        },
        () => conn = db.openMongoDB("mongodb://127.0.0.1/test"),
        () => {
            try {
                conn.getCollection('test').drop();
            } catch (e) {};
            conn.close();
        });

    test_kv('Redis', {},
        () => conn = db.openRedis("redis://127.0.0.1"),
        () => conn.close());

    test_kv('Redis opts', {
            table_name: 'test', // default: kvs
            prefix: 'test_'
        },
        () => conn = db.openRedis("redis://127.0.0.1"),
        () => {
            try {
                conn.del('test');
            } catch (e) {};
            conn.close();
        });
});

test.run(console.DEBUG);
