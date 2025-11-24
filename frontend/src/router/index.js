import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CameraView from '../views/CameraView.vue'
import MapView from '../views/MapView.vue'
import rankingView from '../views/RankingView.vue'
import profileView from '../views/ProfileView.vue'
import loginView from '../views/LoginView.vue'
import logoutView from '../views/LogoutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/camera',
      name: 'camera',
      component: CameraView
    },
    {
      path: '/map',
      name: 'map',
      component: MapView
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: rankingView
    },
    {
      path: '/profile',
      name: 'profile',
      component: profileView
    },
    {
      path: '/login',
      name: 'login',
      component: loginView
    },
    {
      path: '/logout',
      name: 'logout',
      component: logoutView
    }
  ]
})

export default router