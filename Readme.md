## general key-value store on sql/level/mongo/redis for fibjs

## Install

```sh
npm install fib-kv [--save]
```

## Test

```sh
npm run ci
```

## Creating a key-value store

### var kvs = new kv(conn, opts);

```JavaScript
conn: database connection or connection factory like fib-pool
opts: kvs options
```

opts | default | mem | leveldb | redis | mongodb | sql
---  |    ---  | --- |   ---   |   ---   |  ---  | ---
table_name | "kvs" | x | x | √ | √ | √ 
key_name | "k" | x | x | x | √ | √ 
value_name | "v" | x | x | x | √ | √ 
key_size | 32 | x | x | x | x | √ 
value_size | 256 | x | x | x | x | √ 
prefix | "test_" | √ | √ | √ | √ | √ 
cache | false | √ | √ | √ | √ | √ 

Simple example (memory backend).
```JavaScript
var kv = require("fib-kv");

var kvs = new kv({
    "a": 100,
    "b": 200
});
```

LevelDB backend.
```JavaScript
var kv = require("fib-kv");
var db = require("db");

var kvs = new kv(db.openLevelDB("test.ldb"));
```

fib-pool backend.
```JavaScript
var kv = require("fib-kv");
var db = require("db");
var pool = require("fib-pool");

var kvs = new kv(pool(() => db.openLevelDB("test.ldb")));
```


## Methods

### kvs.setup()
setup the backend database.

### v = kvs.get(k)
returns the value stored for that key.

### kvs.set(k, v)
stores a key-value pair.

### e = kvs.has(k)
returns whether a key is set on the store.

### kvs.remove(k)
deletes a key-value pair by key.

### e = kvs.cache_has(k)
returns whether a key is set on the cache.

### kvs.cache_clear()
removes all the key-value pairs in the cache.