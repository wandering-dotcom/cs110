import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MapView from '../views/MapView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/user/:username',
      name: 'UserProfile',
      component: () => import('../views/UserProfileView.vue'),
    },
    {
      path: '/map/:postId',
      name: 'MapView',
      component: MapView,
    },
    {
      path: '/repost/:postId',
      name: 'RepostView',
      component: () => import('../views/RepostView.vue')
    },
    {
      path: '/post/:postId',
      name: 'SinglePostView',
      component: () => import('../views/SinglePostView.vue'),
    },
  ],
})

export default router
