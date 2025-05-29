import { createRouter, createWebHistory } from 'vue-router'
import ArticleListPage from '../views/ArticleListPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/ArticleListPage.vue')
  },
  {
    path: '/oc/:id?',
    name: 'oc',
    component: () => import('../views/OcPage.vue')
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import(/* webpackChunkName: "about" */ '../views/WorldViewPage.vue')
  },
  {
    path: '/pin/:id',
    name: 'pin',
    component: () => import('../views/PinDetailPage.vue')
  },
  {
    path: '/user/:id',
    name: 'user',
    component: () => import(/* webpackChunkName: "about" */ '../views/UserCenter.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
