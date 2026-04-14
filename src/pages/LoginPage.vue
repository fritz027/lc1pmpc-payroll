<template>
  <v-app>
    <v-main>
      <v-container fluid class="login-page pa-0 ma-0">
        <v-row class="fill-height no-gutters">
          <!-- Left Illustration Panel -->
          <v-col cols="12" md="6" class="gradient-bg d-none d-sm-none d-md-flex">
            <v-row class="row no-gutters">
              <v-col cols="12">
                <v-img :src="logo" max-width="220" height="220" class="animate-bounce" />
              </v-col>
              <v-col cols="12">
                <p class="text-h6 font-weight-bold text-center">
                  La Castellana 1 Personnel Multi-Purpose Cooperative
                </p>
              </v-col>
            </v-row>
          </v-col>

          <!-- Right Login Form -->
          <v-col cols="12" md="6" class="d-flex align-center justify-center pa-6">
            <v-card class="pa-8 rounded-xl shadow-lg form-card" max-width="420" width="100%">
              <v-card-title class="text-h6 font-weight-bold mb-4 text-center">
                LC1PMPC EMPLOYEE LOGIN
              </v-card-title>
              <v-alert
                v-if="errorMessage"
                border="start"
                class="mb-4"
                elevation="2"
                prominent
                type="error"
                variant="tonal"
              >
                {{ errorMessage }}
              </v-alert>

              <v-card-subtitle class="mb-6 text-center">
                Please sign-in to your account and start the adventure.
              </v-card-subtitle>

              <v-form>
                <v-text-field
                  v-model="employeeNo"
                  label="Employee No."
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  rounded
                  density="comfortable"
                  class="mb-4"
                  required
                />

                <v-text-field
                  v-model="password"
                  label="Password"
                  prepend-inner-icon="mdi-lock"
                  variant="outlined"
                  rounded
                  density="comfortable"
                  class="mb-2"
                  required
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                />
                <!--
                <v-row align="center" justify="space-between" class="my-2">
                  <v-checkbox label="Remember Me" hide-details />
                  <v-btn variant="text" size="small" class="text-blue">Forgot Password?</v-btn>
                </v-row> -->

                <v-btn color="primary" class="mb-4" block rounded @click="singIn">Sign In</v-btn>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/Api/Auth'
import { useAuthStore } from '@/stores/auth'
import logo from '@/assets/logo.png'

const authStore = useAuthStore()

const employeeNo = ref('')
const password = ref('SEPTEMBER19')
const router = useRouter()
const showPassword = ref<boolean>(false)
const errorMessage = ref('')

const singIn = async () => {
  try {
    const result = await authApi.Login({
      employeeNo: employeeNo.value,
      password: password.value,
    })

    if (!result.data.success) {
      errorMessage.value = result.data.message
    }
    const { accessToken, employee, firstLogin, role } = result.data
    authStore.setAccessToken(accessToken)
    authStore.setEmployee(employee)
    authStore.setRole(role)
    const gender = employee?.gender || ''
    authStore.setGender(gender)
    authStore.setFirstLogin(firstLogin)

    authStore.login({
      accessToken,
      employee,
      firstLogin,
      gender,
      role,
    })

    router.push('/announcements')
  } catch (error: unknown) {
    errorMessage.value =
      (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Server error'
    console.log(error)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  height: 100vh;
}

.gradient-bg {
  background: linear-gradient(135deg, #42e987 0%, #3b82f6 100%);
  color: white;
  justify-content: center; /* vertical centering of whole block */
  align-items: center; /* horizontal centering */
  min-height: 100vh; /* full height */
  gap: 16px; /* space between logo and text */
  text-align: center; /* center text */
}

.form-card {
  background-color: white;
}

.text-purple {
  color: #7b1fa2 !important;
}

.animate-bounce {
  margin: auto;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
