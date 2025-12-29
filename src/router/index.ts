import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Home from '@/pages/Home.vue'
import TimeCard from '@/views/employee/TimeCard.vue'
import Announcement from '@/views/admin/annoucement/announcement.vue'
import Announcements from '@/views/admin/annoucement/announcements.vue'
import EditAnnouncment from '@/views/admin/annoucement/edit.vue'
import EmployeeSuggestions from '@/views/employee/suggestion/suggestions.vue'
import Payslip from '@/views/employee/Payslip.vue'
import NewEmployeeSuggestion from '@/views/employee/suggestion/create.vue'
import EmployeeAnnouncements from '@/views/employee/Announcements.vue'
import Suggestions from '@/views/admin/suggestions/suggestions.vue'
import Settings from '@/views/admin/settings/settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '/timecard',
          name: 'timecard',
          component: TimeCard,
        },
        {
          path: '/announcements',
          name: 'announcement',
          component: EmployeeAnnouncements,
        },
        {
          path: '/payslip',
          name: 'payslip',
          component: Payslip,
        },
        {
          path: '/suggestions',
          name: 'suggestions',
          component: EmployeeSuggestions,
        },
        {
          path: '/suggestion/new',
          name: 'suggestion',
          component: NewEmployeeSuggestion,
        },
        {
          path: '/admin/announcement',
          name: 'adminAnnouncement',
          component: Announcement,
        },
        {
          path: '/admin/announcements',
          name: 'adminAnnouncements',
          component: Announcements,
        },
        {
          path: '/admin/announcement/edit/:id',
          name: 'adminEditAnnouncement',
          component: EditAnnouncment,
        },
        {
          path: '/admin/suggestions',
          name: 'adminSsuggestions',
          component: Suggestions,
        },
        {
          path: '/admin/settings',
          name: 'settings',
          component: Settings,
        },
      ],
    },
  ],
})

router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

// 4. Auth guard
router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !isLoggedIn) {
    console.warn('Access denied, redirecting to login')
    return '/login'
  }

  if (String(to.name) === 'Login' && isLoggedIn) {
    console.warn('Already logged in, redirecting to profile')
    return '/announcements'
  }
})

// 5. Clean up reload flag after router is ready
router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
