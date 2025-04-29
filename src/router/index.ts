import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ArticleListPage from '../views/ArticleListPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: ArticleListPage
  },
  {
    path: '/oc/:id',
    name: 'oc',
    component: () => import(/* webpackChunkName: "about" */ '../views/OcPage.vue')
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import(/* webpackChunkName: "about" */ '../views/WorldViewPage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
