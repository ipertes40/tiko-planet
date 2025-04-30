import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { ElInfiniteScroll } from 'element-plus'
import initMockService from './mock'
// mock 配置
if (import.meta.env.MODE === 'development') {
  initMockService()
}
const app = createApp(App)

// 注册无限滚动指令
app.directive('infinite-scroll', ElInfiniteScroll)


// 注册懒加载 

  // 懒加载指令
  app.directive('lazy', {
    mounted(el: HTMLImageElement, binding) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.src = binding.value
            observer.unobserve(el)
          }
        })
      }, { rootMargin: '200px' })
      observer.observe(el)
    }
  })

app.use(store)
app.use(router)
app.mount('#app')