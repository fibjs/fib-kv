/// <reference types="@fibjs/types" />
/// <reference types="fib-pool" />

declare namespace FibKV {
    type ms = number
    type SQL_VALUE_TYPE =
        'TINYBLOB' | 'BLOB' | 'MEDIUMBLOB' | 'LONGBLOB' |
        'TINYTEXT' | 'TEXT' | 'MEDIUMTEXT' | 'LONGTEXT' |
        'VARCHAR'

    interface FibKVOptions {
        table_name?: string
        key_name?: string
        value_name?: string
        key_size?: number
        value_size?: number
        pool_name?: string
        cleanup_interval?: ms
        timeout?: ms
        prefix?: string
        cache?: boolean
        cache_size?: number
        cache_timeout?: ms

        sql_value_type?: SQL_VALUE_TYPE
    }

    type FibKVValueType = string | any | null

    interface FibKVInstance {
        setup: () => void
        get: (key: string) => FibKV.FibKVValueType
        set: (key: string, value: any) => FibKV.FibKVValueType
        has: (key: string) => boolean
        keys: () => string[]
        renew: (key: string) => void
        remove: (key: string) => void
        cache_has: (key: string) => boolean
        cache_clear: () => void
    }

    interface FibKVConstructor<T = Class_DbConnection> {
        new (conn: T | FibPoolNS.FibPool<T>, opts: FibKV.FibKVOptions): FibKVInstance
        prototype: FibKVInstance
    }
}

declare module "fib-kv" {
    const mod: FibKV.FibKVConstructor
    export = mod
}
