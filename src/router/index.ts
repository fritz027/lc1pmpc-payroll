import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/LoginPage.vue'
import Home from '@/pages/HomePage.vue'
import TimeCard from '@/views/employee/TimeCard.vue'
import Announcement from '@/views/admin/annoucement/announcement.vue'
import Announcements from '@/views/admin/annoucement/announcements.vue'
import EditAnnouncment from '@/views/admin/annoucement/edit.vue'
import EmployeeSuggestions from '@/views/employee/suggestion/suggestions.vue'
import Payslip from '@/views/employee/PayslipPage.vue'
import NewEmployeeSuggestion from '@/views/employee/suggestion/create.vue'
import EmployeeAnnouncements from '@/views/employee/Announcements.vue'
import Suggestions from '@/views/admin/suggestions/suggestions.vue'
import Settings from '@/views/admin/settings/settings.vue'
import UserRoles from '@/views/admin/superAdmin/userRoles.vue'
import userApprover from '@/views/admin/superAdmin/userApprover.vue'
import leavePage from '@/views/employee/leave/leavePage.vue'
import Overtime from '@/views/employee/overtime/OvertimePage.vue'
import Attendance from '@/views/employee/attendance/AttendancePage.vue'
import LeaveAprrove from '@/views/admin/approvers/LeaveApprovePage.vue'
import OvertimeApprove from '@/views/admin/approvers/OvertimeApprovePage.vue'
import AttendanceApprove from '@/views/admin/approvers/AttendanceApprovePage.vue'
import TravelOrderList from '@/views/employee/travelOrder/TravelOrderList.vue'
import TravelOderApprove from '@/views/admin/approvers/TravelOrderApprovePage.vue'
import ShiftPage from '@/views/employee/shift/shiftPage.vue'
import ChangeOff from '@/views/admin/approvers/ChangeOffApprovePage.vue'
import CodeOfConduct from '@/views/employee/CondeOfConduct.vue'
import ManPowerRequest from '@/views/admin/manpower/manpowerRequest.vue'

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
          path: '/leave',
          name: 'leavePage',
          component: leavePage,
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
        {
          path: '/admin/user-roles',
          name: 'UserRoles',
          component: UserRoles,
        },
        {
          path: '/admin/user-approver',
          name: 'userApprover',
          component: userApprover,
        },
        {
          path: '/over-time',
          name: 'Overtime',
          component: Overtime,
        },
        {
          path: '/attendance',
          name: 'Attendance',
          component: Attendance,
        },
        {
          path: '/admin/leave-approve',
          name: 'LeaveAprrove',
          component: LeaveAprrove,
        },
        {
          path: '/admin/overtime-approve',
          name: 'OvertimeApprove',
          component: OvertimeApprove,
        },
        {
          path: '/admin/attendance-approve',
          name: 'AttendanceApprove',
          component: AttendanceApprove,
        },
        {
          path: '/travel-order',
          name: 'TravelOrderList',
          component: TravelOrderList,
        },
        {
          path: '/admin/travel-order-approve',
          name: 'TravelOderApprove',
          component: TravelOderApprove,
        },
        {
          path: '/schedule',
          name: 'ShiftPage',
          component: ShiftPage,
        },
        {
          path: '/admin/change-day-off-approve',
          name: 'ChangeDayOffApprove',
          component: ChangeOff,
        },
        {
          path: '/code-of-conduct',
          name: 'CodeOfConduct',
          component: CodeOfConduct,
        },
        {
          path: '/admin/manpower-request',
          name: 'ManPowerRequests',
          component: ManPowerRequest,
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
