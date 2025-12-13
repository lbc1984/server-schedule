import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import ScheduleList from '../components/ScheduleList.vue'
import { auth } from '../firebase'

const routes = [
  {
    path: '/schedule',
    name: 'ScheduleList',
    component: ScheduleList,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = auth.currentUser

  if (to.meta.requiresAuth && !user) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && user) {
    next({ name: 'ScheduleList' })
  } else {
    next()
  }
})

export default router
