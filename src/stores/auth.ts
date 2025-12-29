import { defineStore } from 'pinia'
import type { AuthState, Employee } from '@/types/auth'
import router from '@/router'
import { startIdleLogout, stopIdleLogout } from '@/utils/idleLogOuts'

const CLOSE_TIMEOUT = 20 * 1000 //5 * 60 * 1000

interface LoginPayLoad {
  accessToken: string
  employee: Employee
  role: string
  gender: string
  firstLogin: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: '',
    employee: null,
    role: 'user',
    gender: null,
    firstLogin: true,
    lastActivity: null,
  }),
  persist: true,
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    getUser: (state) => state.employee,
    getRole: (state) => state.role,
    getGender: (state) => state.gender,
    getFirstLogin: (state) => state.firstLogin,
  },
  actions: {
    login(payload: LoginPayLoad) {
      this.accessToken = payload.accessToken
      this.employee = payload.employee
      this.role = payload.role
      this.gender = payload.gender
      this.firstLogin = payload.firstLogin
      this.startSession()
    },

    startSession() {
      startIdleLogout(() => {
        console.warn('⏰ Idle logout triggered')
        this.logout('idle-timeout')
      })
    },
    setAccessToken(token: string) {
      this.accessToken = token
      localStorage.setItem('accessToken', token)
    },
    setEmployee(employee: Employee | null) {
      this.employee = employee
    },
    setRole(role: string) {
      this.role = role
    },
    setFirstLogin(firstLogin: boolean) {
      this.firstLogin = firstLogin
    },
    setGender(gender: string) {
      this.gender = gender
    },
    logout(reason: string = 'manual') {
      console.log('Logout:', reason)
      stopIdleLogout()

      this.accessToken = ''
      this.employee = null
      this.firstLogin = true
      this.role = 'user'
      this.gender = null
      this.firstLogin = false
      localStorage.removeItem('accessToken')
      router.push('/login')
    },
  },
})
