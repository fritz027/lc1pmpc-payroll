<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="!mobile && rail"
      :expand-on-hover="!mobile && rail"
      :permanent="!mobile"
      :temporary="mobile"
      rail-width="68"
      width="280"
      :class="[
        { 'no-scroll': !mobile && rail },
        { 'force-rail': !mobile && rail },
        { 'rail-hover': !mobile && rail && hovered },
      ]"
      class="pa-2 group"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <v-row align="center" justify="space-between" class="px-4 mb-4 mt-2">
        <v-img :src="logo" max-width="50" class="drawer-logo" />

        <v-tooltip text="Toggle Drawer" location="right" v-if="!mobile">
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

      <v-list v-model:opened="openGroups">
        <template v-for="(group, index) in visibleGroups" :key="group.title">
          <v-list-group :value="group.title">
            <template #activator="{ props }">
              <v-list-item v-bind="props" class="group-header">
                <template #prepend>
                  <v-icon :icon="group.icon" color="success"></v-icon>
                </template>
                <v-list-item-title v-if="mobile || !rail || hovered">
                  {{ group.title }}
                </v-list-item-title>
              </v-list-item>
            </template>

            <v-list-item
              v-for="item in group.items"
              :key="item.title"
              :to="item.route"
              link
              nav
              class="group-item"
            >
              <template #prepend>
                <v-icon class="submenu-icon-small" color="blue-lighten-2">{{ item.icon }}</v-icon>
              </template>

              <v-list-item-title v-if="mobile || !rail || hovered">
                {{ item.title }}
              </v-list-item-title>
              <v-list-item-title v-else>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-title>
            </v-list-item>
          </v-list-group>

          <v-divider v-if="index < visibleGroups.length - 1" class="my-2" />
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" dark shadow>
      <v-app-bar-nav-icon v-if="mobile" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title class="d-flex flex-column justify-center">
        <div style="line-height: 1.2" class="text-subtitle-1 font-weight-bold sm:text-h6">
          LC1PMPC PAYROLL
        </div>

        <div
          v-if="mobile && authStore.getPayrollInit"
          class="text-caption mt-1 d-flex align-center"
          style="line-height: 1; opacity: 0.85"
          @click="payrollInitSetup"
        >
          <v-icon size="x-small" class="mr-1">mdi-calendar-check</v-icon>
          ({{ formatDate(authStore.getPayrollInit.pay_fr) }} -
          {{ formatDate(authStore.getPayrollInit.pay_to) }})
        </div>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <div
        v-if="!mobile && authStore.getPayrollInit"
        class="d-flex align-center mr-6 px-3 py-1 rounded"
        style="background-color: rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.2)"
        @click="payrollInitSetup"
      >
        <v-icon size="small" class="mr-2">mdi-calendar-check</v-icon>
        <span class="text-body-2 font-weight-medium">
          ({{ formatDate(authStore.getPayrollInit.pay_fr) }} to
          {{ formatDate(authStore.getPayrollInit.pay_to) }})
        </span>
      </div>

      <v-menu offset-y max-width="200">
        <template #activator="{ props }">
          <v-btn text v-bind="props" class="d-flex align-center">
            <v-avatar size="36" class="me-2" color="white">
              <v-img :src="avatar" :alt="name" contain />
            </v-avatar>
            <span class="me-2" v-if="!mobile">{{ name }}</span>
            <v-icon size="20">mdi-menu-down</v-icon>
          </v-btn>
        </template>

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

    <v-main>
      <v-container class="d-flex justify-center pa-6">
        <router-view />
      </v-container>
    </v-main>

    <v-dialog v-model="showPasswordDialog" max-width="480">
      <v-card>
        <v-card-title class="mt-5">
          <v-row align="center" justify="space-between" class="w-100">
            <span class="text-h6 font-weight-semibold pl-4">Change Password</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="grey-darken-1"
              @click="showPasswordDialog = false"
            />
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-form ref="passwordForm">
            <v-text-field
              v-model="currentPassword"
              label="Current Password"
              :rules="[rules.required]"
              :error="!!passwordError"
              :error-messages="passwordErrorMessage"
              variant="underlined"
              type="password"
            />
            <v-text-field
              v-model="newPassword"
              label="New Password"
              :rules="[rules.required, rules.minLength]"
              variant="underlined"
              type="password"
            />
            <v-text-field
              v-model="confirmNewPassword"
              label="Confirm New Password"
              :rules="[rules.required, rules.matchPassword]"
              variant="underlined"
              type="password"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" class="mb-4 px-6" rounded variant="elevated" @click="savePassword">
            Update Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PAYROLL INIT DIALOG -->
    <v-dialog v-model="showPayrollDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white d-flex align-center py-3">
          <v-icon class="mr-3">mdi-calendar-clock</v-icon>
          Select Payroll Period
        </v-card-title>

        <v-card-text class="pt-6">
          <v-select
            v-model="selectedPayroll"
            :items="filteredPayrollPeriods"
            label="Select Date (From - To)"
            variant="outlined"
            return-object
            item-value="init_cd_full"
          >
            <template #selection="{ item }">
              <span :class="{ 'text-red text-decoration-line-through': item.raw.posted === '1' }">
                {{ item.raw.init_cd_full }} ({{ formatDate(item.raw.pay_fr) }} to
                {{ formatDate(item.raw.pay_to) }})
              </span>
            </template>

            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="undefined">
                <v-list-item-title
                  :class="{ 'text-red text-decoration-line-through': item.raw.posted === '1' }"
                >
                  {{ item.raw.init_cd }} | {{ item.raw.phalf }} |
                  {{ formatDate(item.raw.pay_fr) }} to
                  {{ formatDate(item.raw.pay_to) }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn v-if="authStore.getPayrollInit" variant="text" @click="cancelPayrollSelection"
            >Cancel</v-btn
          >
          <v-btn color="primary" variant="elevated" class="px-6" @click="confirmPayrollSelection">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import type { VForm } from 'vuetify/components/VForm'
import logo from '@/assets/logo.png'
import female from '@/assets/female.png'
import male from '@/assets/male.png'
import { useRouter } from 'vue-router'
import emloyeeApi from '@/Api/Employee'
import type { PayrollInit } from '@/types/auth'

// Initialize Vuetify display breakpoint
const { mobile } = useDisplay()

// UI States
const drawer = ref(true)
const rail = ref(false)
const hovered = ref(false)
const openGroups = ref(['Employee Menu'])

// --- PAYROLL MODAL STATES ---
const showPayrollDialog = ref(false)
const selectedPayroll = ref<PayrollInit | null>(null)
const currentYear = new Date().getFullYear()
const payrollPeriods = ref<PayrollInit[]>([])

// User Information
const authStore = useAuthStore()
const router = useRouter()
const name = ref('')
const avatar = ref('')
const role = ref<string>('')

// Form & Snackbar States
const showPasswordDialog = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordForm = ref<VForm>()
const passwordError = ref(false)
const passwordErrorMessage = ref('')
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// --- MENU CONFIGURATION (CENTRALIZED RBAC) ---
const menuGroups = [
  {
    title: 'Employee Menu',
    icon: 'mdi-account-group',
    roles: ['user', 'approver', 'admin', 'superadmin', 'hr'],
    items: [
      { title: 'Announcement', icon: 'mdi-bullhorn', route: '/announcements' },
      { title: 'Time Card', icon: 'mdi-timetable', route: '/timecard' },
      { title: 'Pay Slip', icon: 'mdi-receipt-text', route: '/payslip' },
      { title: 'Suggestions', icon: 'mdi-lightbulb', route: '/suggestions' },
      { title: 'Leave', icon: 'mdi-calendar-check', route: '/leave' },
      { title: 'Over-Time', icon: 'mdi-clock-check-outline', route: '/over-time' },
      { title: 'Attendance', icon: 'mdi-clipboard-account', route: '/attendance' },
      { title: 'Travel Order', icon: 'mdi-rv-truck', route: '/travel-order' },
      { title: 'Change Day-off', icon: 'mdi-clipboard-text-clock', route: '/schedule' },
      { title: 'Code Of Conduct', icon: 'mdi-file-document-multiple', route: '/code-of-conduct' },
    ],
  },
  {
    title: 'Approver Menu',
    icon: 'mdi-check-decagram',
    roles: ['approver', 'admin', 'superadmin', 'hr'],
    items: [
      { title: 'Leaves', icon: 'mdi-calendar-clock', route: '/admin/leave-approve' },
      {
        title: 'Over-Time',
        icon: 'mdi-archive-clock-outline',
        route: '/admin/overtime-approve',
      },
      {
        title: 'Attendance',
        icon: 'mdi-account-check',
        route: '/admin/attendance-approve',
      },
      {
        title: 'Travel Order',
        icon: 'mdi-airplane-takeoff',
        route: '/admin/travel-order-approve',
      },
      {
        title: 'Change Day-off',
        icon: 'mdi-sun-clock',
        route: '/admin/change-day-off-approve',
      },
    ],
  },
  {
    title: 'Admin Menu',
    icon: 'mdi-shield-account',
    roles: ['admin', 'superadmin', 'hr'],
    items: [
      { title: 'Announcement Admin', icon: 'mdi-bullhorn', route: '/admin/announcements' },
      { title: 'Suggestions Admin', icon: 'mdi-lightbulb-on', route: '/admin/suggestions' },
      { title: 'Manpower Request', icon: 'mdi-account-hard-hat', route: '/admin/manpower-request' },
      { title: 'Settings', icon: 'mdi-cog', route: '/admin/settings' },
    ],
  },
  {
    title: 'Super Admin',
    icon: 'mdi-account-key',
    roles: ['superadmin', 'hr'],
    items: [
      { title: 'User Approvers', icon: 'mdi-clipboard-check', route: '/admin/user-approver' },
      { title: 'User Roles', icon: 'mdi-account-multiple-plus', route: '/admin/user-roles' },
    ],
  },
]

// Logic to filter the entire group based on user role
const visibleGroups = computed(() => {
  return menuGroups.filter((group) => group.roles.includes(role.value.toLowerCase()))
})

// Validation Rules
const rules = {
  required: (v: any) => !!v || 'This field is required',
  matchPassword: (v: string) => v === newPassword.value || 'Passwords do not match',
  minLength: (v: string) => (v && v.length >= 8) || 'Minimum 8 characters',
}

onMounted(() => {
  if (authStore.employee) {
    name.value = `${authStore.employee.lastName}, ${authStore.employee.firstName}`
    avatar.value = authStore.employee.gender === 'F' ? female : male
  }
  // Load role and ensure it is lowercase for comparison
  role.value = (authStore.role || 'user').toLowerCase()

  // Auto-close drawer initially on mobile
  if (mobile.value) {
    drawer.value = false
  }
  checkPayrollInit()
})

const toggleRail = () => {
  rail.value = !rail.value
}

const formatDate = (dateString: string | Date) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  // Get short month (e.g., "Mar"), day, and year
  const month = date.toLocaleString('default', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()

  // If you strictly want the month lowercase like "mar", you can use:
  // return `${month.toLowerCase()} ${day} ${year}`

  return `${month} ${day} ${year}`
}

const checkPayrollInit = async () => {
  // If the user hasn't selected a payroll period yet, pop the modal
  if (!authStore.getPayrollInit) {
    showPayrollDialog.value = true
    const res = await emloyeeApi.PayrollInitials(authStore.accessToken)
    if (res.data.success) {
      payrollPeriods.value = res.data.payrollInit
    }
  }
}

const payrollInitSetup = async () => {
  if (authStore.getPayrollInit) {
    selectedPayroll.value = authStore.getPayrollInit
  }
  showPayrollDialog.value = true
  console.log(selectedPayroll.value)
  const res = await emloyeeApi.PayrollInitials(authStore.accessToken)

  if (res.data.success) {
    payrollPeriods.value = res.data.payrollInit

    // Safely re-map the selection to the exact object from the new API array
    if (authStore.getPayrollInit) {
      const match = payrollPeriods.value.find(
        (p) => p.init_cd_full === authStore.getPayrollInit?.init_cd_full,
      )
      if (match) {
        selectedPayroll.value = match
      }
    }
  }
}

const filteredPayrollPeriods = computed(() => {
  return payrollPeriods.value.filter((period) => {
    if (!period.pay_to) return false

    // Extract the year from the pay_to date
    const payToYear = new Date(period.pay_to).getFullYear()

    // Keep it if the year matches the current year
    return payToYear === currentYear
  })
})

// --- ACTION HANDLERS ---
const confirmPayrollSelection = () => {
  console.log(selectedPayroll.value)
  if (!selectedPayroll.value) {
    console.log('No payroll selected')
    return
  }

  authStore.setPayrollInit(selectedPayroll.value)
  showPayrollDialog.value = false
  snackbarMessage.value = `Payroll period ${selectedPayroll.value?.init_cd_full ?? ''} selected.`
  snackbarColor.value = 'success'
  snackbar.value = true
}

const cancelPayrollSelection = () => {
  showPayrollDialog.value = false
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
  if (validationResult?.valid) {
    try {
      const response = await emloyeeApi.UpdateEmplyoeePassword(authStore.accessToken, {
        employeeNo: authStore.employee?.employeeNo || '',
        newPassword: newPassword.value,
        oldPassword: currentPassword.value,
      })

      if (response.data.success) {
        showPasswordDialog.value = false
        snackbar.value = true
        snackbarColor.value = 'green'
        snackbarMessage.value = 'Password updated successfully!'
        currentPassword.value = ''
        newPassword.value = ''
        confirmNewPassword.value = ''
      } else {
        passwordError.value = true
        passwordErrorMessage.value = response.data.message
      }
    } catch (error: any) {
      passwordError.value = true
      passwordErrorMessage.value = error.response?.data?.message || 'Server error'
    }
  }
}
</script>

<style scoped>
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

.no-scroll {
  overflow: hidden !important;
}

.force-rail .drawer-logo {
  margin: 0 auto !important;
  display: block !important;
}

.v-navigation-drawer--rail .v-list-item__prepend {
  max-width: 40px !important;
  min-width: 40px !important;
  margin-left: 4px !important;
}
/* Force submenu items to align their icons when the drawer is collapsed */
.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering) .v-list-group .group-item {
  /* Overrides Vuetify's default deep indentation */
  padding-inline-start: 12px !important;
}

/* Ensure the prepend icon area aligns perfectly with the main icons */
.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering)
  .v-list-group
  .v-list-item__prepend {
  margin-inline-start: 0 !important;
}
.submenu-icon-small {
  font-size: 18px !important;
}
.group-header {
  font-weight: bold;
  color: #555;
}
/* Target the active list item to give it a solid blue background */
.group-item.v-list-item--active {
  background-color: #2196f3 !important; /* Vuetify's standard blue */
  color: white !important;
}

/* Ensure the icon also turns white to match the text */
.group-item.v-list-item--active .v-icon {
  color: white !important;
}
</style>
