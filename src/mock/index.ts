import Mock from 'mockjs'
import articleRoutes from './modules/article'

/**
 * 初始化 Mock 服务
 */
const initMockService = () => {
  // 1. 环境判断（开发环境 + 未手动禁用 Mock）
  const isDev = import.meta.env.MODE === 'development'
  const urlParams = new URLSearchParams(window.location.search)
  const isMockDisabled = urlParams.has('disableMock')

  if (!isDev || isMockDisabled) {
    console.log('[Mock] Service disabled')
    return
  }

  // 2. 全局配置
  Mock.setup({
    timeout: '200-600' // 随机延迟 200ms~600ms
  })

  // 3. 类型安全的路由注册
  const registerRoutes = (routes: Array<{
    url: string | RegExp
    method: string
    response: Function
  }>) => {
    routes.forEach(route => {
      const url = typeof route.url === 'string' 
        ? new RegExp(route.url) 
        : route.url
      
      Mock.mock(
        url,
        route.method.toLowerCase(),
        route.response
      )
      console.log(`[Mock] Registered: ${route.method.toUpperCase()} ${route.url}`)
    })
  }

  // 4. 注册所有模块
  registerRoutes([...articleRoutes])

  console.log('[Mock] Service started')
}

// 启动 Mock
export default initMockService