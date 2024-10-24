import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import MainPage from '../views/MainPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Main', // Login
      component: MainPage // LoginPage
    },
    {
      path: '/',
      name: 'Main',
      component: MainPage
    }
  ]
})

export default router
