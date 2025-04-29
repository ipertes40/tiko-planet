interface ImportMetaEnv {
    readonly MODE: 'development' | 'production' | 'test'
    // 其他自定义环境变量...
}

interface ImportMeta {
readonly env: ImportMetaEnv
}