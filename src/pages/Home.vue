<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      :expand-on-hover="rail"
      permanent
      rail-width="68"
      width="280"
      :class="[{ 'no-scroll': rail }, { 'force-rail': rail }, { 'rail-hover': rail && hovered }]"
      class="pa-2 group"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <!-- Drawer Header with Logo + Toggle Button -->
      <v-row align="center" justify="space-between" class="px-4 mb-4 mt-2">
        <v-img :src="logo" max-width="50" class="drawer-logo" />

        <v-tooltip text="Toggle Drawer" location="right">
          <template #activator="{ props }">
            <v-btn
              variant="text"
              v-bind="props"
              @click="toggleRail"
              v-show="!rail || hovered"
              class="ml-auto rail-toggle"
            >
              <v-icon :class="rail ? 'switch-off' : 'switch-on'">mdi-toggle-switch</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </v-row>

      <!-- MENU LISTS -->
      <v-list>
        <!-- EMPLOYEE SECTION -->
        <v-list-group v-model="employeeOpen" prepend-icon="mdi-account-group">
          <template #activator="{ props }">
            <v-list-item v-bind="props" class="group-header">
              <v-list-item-title v-if="!rail || hovered"> Employee Menu </v-list-item-title>
            </v-list-item>
          </template>

          <!-- Submenu items -->
          <v-list-item
            v-for="item in employeeMenuItems"
            :key="item.title"
            :to="item.route"
            link
            nav
            class="group-item"
          >
            <template #prepend>
              <v-icon class="submenu-icon-small">{{ item.icon }}</v-icon>
            </template>

            <v-list-item-title v-if="!rail || hovered">
              {{ item.title }}
            </v-list-item-title>
            <v-list-item-title v-else>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-divider class="my-2" />

        <!-- ADMIN SECTION -->
        <v-list-group v-model="adminOpen" prepend-icon="mdi-shield-account" v-if="role === 'admin'">
          <template #activator="{ props }">
            <v-list-item v-bind="props" class="group-header">
              <v-list-item-title v-if="!rail || hovered"> Admin Menu </v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item
            v-for="item in adminMenuItems"
            :key="item.title"
            :to="item.route"
            link
            nav
            class="group-item"
          >
            <template #prepend>
              <v-icon class="submenu-icon-small">{{ item.icon }}</v-icon>
            </template>

            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar color="primary" dark>
      <v-app-bar-title>LC1PMPC PAYROLL</v-app-bar-title>

      <!-- Push everything to the right -->
      <v-spacer></v-spacer>

      <v-menu offset-y max-width="200">
        <template #activator="{ props }">
          <v-btn text v-bind="props" class="d-flex align-center">
            <!-- Avatar -->
            <v-avatar size="36" class="me-2" color="white">
              <v-img :src="avatar" :alt="name" contain />
            </v-avatar>

            <!-- Optional username -->
            <span class="me-2">{{ name }}</span>

            <!-- Down arrow -->
            <v-icon size="20">mdi-menu-down</v-icon>
          </v-btn>
        </template>

        <!-- Dropdown menu items -->
        <v-list>
          <v-list-item @click="changePassword">
            <v-list-item-title>Change Password</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <v-container class="d-flex justify-center">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
  <v-dialog v-model="showPasswordDialog" max-width="480">
    <v-card>
      <v-card-title class="mt-5">
        <v-row align="center" justify="space-between" class="w-100">
          <span class="text-h6 font-weight-semibold pl-4">Change Password</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="grey-darken-1"
            @click="showPasswordDialog = !showPasswordDialog"
          />
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-form ref="passwordForm">
          <v-text-field
            v-model="currentPassword"
            color="primary"
            label="Current Password"
            :rules="[rules.required]"
            :error="!!passwordError"
            :error-messages="passwordErrorMessage"
            variant="underlined"
          />
          <v-text-field
            v-model="newPassword"
            color="primary"
            label="New Password"
            :rules="[rules.required, rules.minLength, rules.matchPassword]"
            variant="underlined"
          />
          <v-text-field
            v-model="confirmNewPassword"
            color="primary"
            label="Confirm New Password"
            :rules="[rules.required, rules.minLength, rules.matchPassword, rules.matchPassword]"
            variant="underlined"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" class="mb-4" rounded @click="savePassword">Change Password</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { VForm } from 'vuetify/components/VForm'
import logo from '@/assets/logo.png'
import female from '@/assets/female.png'
import male from '@/assets/male.png'
import { useRouter } from 'vue-router'
import type { ChangePassword } from '@/types/general'
import emloyeeApi from '@/Api/Employee'

const drawer = ref(true)
const rail = ref(false)
const hovered = ref(false)
const name = ref('')
const avatar = ref('')
const authStore = useAuthStore()
const router = useRouter()
const showPasswordDialog = ref<Boolean>(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordForm = ref<VForm>()
const passwordError = ref<Boolean>(false)
const passwordErrorMessage = ref('')
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('greed')
const role = ref<String>('')

const rules = {
  required: (v: any) => !!v?.length || 'This field is required',
  matchPassword: (v: string) => v === newPassword.value || 'Confirm new password did not match',
  minLength: (v: string) => (v && v.length >= 8) || 'Password must be aleast 8 characters',
  maxLength: (v: string) => (v && v.length <= 15) || `Password must be no more than 15 characters`,
}

onMounted(() => {
  name.value = `${authStore.employee?.lastName}, ${authStore.employee?.firstName}`
  if (authStore.employee?.gender === 'F') {
    avatar.value = female
  } else {
    avatar.value = male
  }

  role.value = authStore.role || 'user'
})

const employeeOpen = ref(false)
const adminOpen = ref(false)

const employeeMenuItems = [
  { title: 'Announcement', icon: 'mdi-bullhorn', route: '/announcements' },
  { title: 'Time Card', icon: 'mdi-timetable', route: '/timecard' },
  { title: 'Pay Slip', icon: 'mdi-receipt-text', route: '/payslip' },
  { title: 'Suggestions', icon: 'mdi-lightbulb', route: '/suggestions' },
]

const adminMenuItems = [
  { title: 'Announcement', icon: 'mdi-bullhorn', route: '/admin/announcements' },
  { title: 'Suggestions', icon: 'mdi-lightbulb-on', route: '/admin/suggestions' },
  { title: 'Settings', icon: 'mdi-cog', route: '/admin/settings' },
  // { title: 'Time Off Approvals', icon: 'mdi-calendar-check', route: 'admin/timeoff' },
  // { title: 'User Management', icon: 'mdi-account-cog', route: 'admin/users' },
]

const toggleRail = () => {
  rail.value = !rail.value
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
const changePassword = () => {
  showPasswordDialog.value = true
}
const savePassword = async () => {
  const validationResult = await passwordForm.value?.validate()
  if (validationResult && validationResult.valid) {
    try {
      const response = await emloyeeApi.UpdateEmplyoeePassword(authStore.accessToken, {
        employeeNo: authStore.employee?.employeeNo || '',
        newPassword: newPassword.value || '',
        oldPassword: currentPassword.value || '',
      })

      if (!response.data.success) {
        passwordError.value = true
        passwordErrorMessage.value = response.data.message
      }

      showPasswordDialog.value = false
      snackbar.value = true
      snackbarColor.value = 'green'
      snackbarMessage.value = response.data.message
    } catch (error: any) {
      passwordError.value = true
      passwordErrorMessage.value = error.response.data.message
      setTimeout(() => {
        passwordError.value = false
        passwordErrorMessage.value = ''
      }, 2000)

      console.log(error)
    }
  } else {
    console.log('Form is invalid or validation failed')
  }
}
</script>
<style>
/* Toggle animation */
.rail-toggle .v-icon {
  transition:
    transform 0.3s ease,
    color 0.3s ease;
}

.switch-on {
  transform: rotate(180deg) scale(1.2);
  color: #7e57c2;
}

.switch-off {
  transform: rotate(0deg) scale(1);
  color: #90a4ae;
}

/* Hide scrolling when collapsed */
.no-scroll {
  overflow: hidden !important;
}

/* Logo centered when rail is active */
.force-rail .drawer-logo {
  margin: 0 auto !important;
  display: block !important;
}
.v-navigation-drawer--rail .drawer-logo {
  margin: 0 auto;
  display: block;
}

.v-navigation-drawer--rail .v-list-item__content {
  padding-left: 0 !important;
}

.v-navigation-drawer--rail .v-list-item--nav {
  padding-left: 0 !important;
}

.v-navigation-drawer--rail .v-list-item__prepend {
  max-width: 40px !important;
  min-width: 40px !important;
  width: 40px !important;
  opacity: 1 !important;
  visibility: visible !important;
}
.v-navigation-drawer--rail:not(.rail-hover) .group-header .v-list-item__prepend {
  max-width: 0 !important;
  min-width: 0 !important;
}

/* Keep submenu icons ALWAYS visible */
.v-navigation-drawer--rail:not(.rail-hover) .group-item .v-list-item__prepend {
  max-width: 40px !important;
  min-width: 40px !important;
}
/* FORCE CENTER ALL ICONS WHEN COLLAPSED */
.force-rail .v-list-item__prepend,
.force-rail .v-list-item__content {
  display: flex !important;
  justify-content: center !important;
  text-align: center !important;
  width: 100% !important;
}

.force-rail .v-list-item__prepend {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  margin-left: 10px !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* Center icons themselves */
.force-rail .v-list-item__prepend .v-icon {
  font-size: 20px !important;
  margin: 0 auto !important;
}

/* Center group-header main icons */
.force-rail .group-header .v-icon {
  margin: 0 auto !important;
}

.rail-hover .v-list-item--nav {
  padding-left: 24px !important; /* Vuetify default */
}

.rail-hover .v-list-item__content {
  padding-left: 12px !important;
}

/* Submenu icons smaller */
.submenu-icon-small {
  font-size: 18px !important;
}

.v-btn .v-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
