<template>
  <router-view />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { startIdleLogout } from './utils/idleLogOuts'
import './assets/main.css'

const authStore = useAuthStore()
const AUTO_LOGOUT_TIME = 20 * 1000 //5 * 60 * 1000 // 5 minutes

window.addEventListener('beforeunload', () => {
  localStorage.setItem('lastClosedTime', Date.now().toString())
})

onMounted(() => {
  const lastClosedTime = Number(localStorage.getItem('lastClosedTime') || '0')

  if (lastClosedTime && Date.now() - lastClosedTime > AUTO_LOGOUT_TIME) {
    authStore.logout('browser-close-auto')
  } else if (authStore.isAuthenticated) {
    startIdleLogout(() => authStore.logout('idle-timeout'))
  }
})
</script>
