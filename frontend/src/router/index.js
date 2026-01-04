import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import ScheduleList from '../components/ScheduleList.vue'
import { auth, db_firestore } from '../firebase'
import { doc, getDoc } from "firebase/firestore";

const routes = [
  {
    path: '/schedule',
    name: 'Schedule',
    component: ScheduleList,
    // meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/logout',
    name: 'Logout',
  },
  {
    path: '/',
    name: 'Home',
    component: ScheduleList,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  // const user = auth.currentUser

  // if (to.meta.requiresAuth && !user) {
  //   return next({ name: 'Login' })
  // }
  // else if(to.name =="Logout"){
  //   await auth.signOut()
  //   return next({name: 'Login'})
  // }

  if(to.name === "Schedule") return next()

  if (to.name === "Schedule" && user) {
    const ref = doc(db_firestore, "allowed_users", "iot")
    const snap = await getDoc(ref)

    const allowed = snap.exists() && snap.data()?.[user.email] === true

    if (!allowed) {
      await auth.signOut()
      return next({ name: 'Login' })
    }
  }

  return next()
})

export default router
