declare namespace FibKVNS {
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

}

declare module "fib-kv" {
    class FibKVInstance {
        setup: () => void
        get: (key: string) => FibKVNS.FibKVValueType
        set: (key: string, value: any) => FibKVNS.FibKVValueType
        has: (key) => boolean
        keys: () => string[]
        renew: (key: string) => void
        remove: (key: string) => void
        cache_has: (key: string) => boolean
        cache_clear: () => void
    }

    interface FibKVGenerator {
        (conn: any, opts: FibKVNS.FibKVOptions): FibKVInstance;
    }
    export = FibKVGenerator
}

export = FibKVNS
