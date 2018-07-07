
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

declare class FibKVInstance {
    setup: () => void
    get: (key: string) => FibKVValueType
    set: (key: string, value: any) => FibKVValueType
    has: (key) => boolean
    keys: () => string[]
    renew: (key: string) => void
    remove: (key: string) => void
    cache_has: (key: string) => boolean
    cache_clear: () => void
}

declare module "fib-kv" {
    interface FibKVGenerator {
        new (conn: any, opts: FibKVOptions): FibKVInstance;
    }
    export = FibKVGenerator
}
