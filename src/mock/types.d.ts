interface MockRoute {
    url: string | RegExp
    method: 'get' | 'post' | 'put' | 'delete'
    response: (options?: any) => any
}