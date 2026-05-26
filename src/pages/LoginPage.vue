<template>
  <v-app>
    <v-main>
      <v-container fluid class="login-page pa-0 ma-0">
        <v-row class="fill-height no-gutters">

          <!-- Left Illustration (Hidden on Mobile) -->
          <v-col v-if="!mobile" cols="12" md="6" class="gradient-bg d-md-flex">
             <v-row class="row no-gutters">
                <v-col cols="12">
                  <v-img :src="logo" max-width="220" height="220" class="animate-bounce" />
                </v-col>
                <v-col cols="12">
                  <p class="text-h6 font-weight-bold text-center">LC1PMPC Online</p>
                </v-col>
             </v-row>
          </v-col>

          <!-- Right Content Area -->
          <v-col cols="12" :md="mobile ? 12 : 6" class="d-flex align-center justify-center pa-6">
            <v-card class="pa-8 rounded-xl shadow-lg" max-width="460" width="100%">

              <!-- Mobile Logo only -->
              <div v-if="mobile" class="text-center mb-4">
                <v-img :src="logo" max-width="100" class="mx-auto" />
              </div>

              <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable>
                {{ errorMessage }}
              </v-alert>

              <!-- Switch between Login and Register -->
              <v-window v-model="step" :touch="false">
                <v-window-item value="login">
                  <LoginForm @switch="step = 'register'" @login="onSignIn" @forgot="step = 'forgot'"  />
                </v-window-item>

                <v-window-item value="register">
                  <RegisterForm @switch="step = 'login'" @register="onRegister" />
                </v-window-item>

                <!-- inside your v-window, after the register item -->
                <v-window-item value="forgot">
                  <ForgotPasswordForm
                    @switch="step = 'login'"
                    @submit="onForgotPassword"
                  />
                </v-window-item>

                <v-window-item value="otp">
                  <OtpForm
                    @switch="FromOTP"
                    @verified="verifyOTP"
                    @resend="ResendOTP"
                    :email="email"
                    :empNo="empNo"
                    :err-msg="errorMessage"
                    :flow-source="flowSource"
                  />
                </v-window-item>

                <v-window-item value="password">
                  <PasswordForm
                    @switch="step = 'login'"
                    @submit="SubmitPassword"
                    :email="email"
                    :empNo="empNo"
                    :errorMsg="errorMessage"
                    :successMessage="succesMessage"
                    :flow-source="flowSource"
                  />
                </v-window-item>
              </v-window>
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
import { useDisplay } from 'vuetify'
import LoginForm from '@/pages/auth/LoginForm.vue'
import RegisterForm from '@/pages/auth/RegisterForm.vue'
import OtpForm from '@/pages/auth/OtpForm.vue'
import PasswordForm from '@/pages/auth/PasswordForm.vue'
import ForgotPasswordForm from '@/pages/auth/ForgotPasswordForm.vue'
import logo from '@/assets/logo.png'

const authStore = useAuthStore()
const { mobile } = useDisplay()

const router = useRouter()
const errorMessage = ref('')
const email = ref('')
const empNo = ref('')
const succesMessage = ref('')
const step = ref('login') // 'login' or 'register'
const flowSource = ref<'register' | 'forgot'>('register')

const onSignIn = async (credentials: { employeeNo: string; password: string }) => {
  try {
    const result = await authApi.Login({
      employeeNo: credentials.employeeNo,
      password: credentials.password,
    })

    if (!result.data.success) {
      errorMessage.value = result.data.message
      return
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

const onRegister = async (formData: { employeeNo: string; email: string; dob: string }) => {
  try {
    // Simulate API call
    // await authApi.Register(formData)
    console.log('Registration data:', formData)
    const response = await authApi.RequestOTP(formData.employeeNo, formData.email)
    if (response.data.success) {
      step.value = 'otp'
      flowSource.value = 'register'
      email.value = formData.email
      empNo.value = formData.employeeNo
    } else {
      errorMessage.value = response.data.message || 'Failed to request OTP. Please try again.'
    }
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

const verifyOTP = async (otpData: { otp: string, email: string, employeeNo: string }) => {
  try {
    errorMessage.value = ''
    const response = await authApi.VerifyOTP(otpData.employeeNo, otpData.email, otpData.otp)

    if (!response.data.success) {
      errorMessage.value = response.data.message
      return
    }

    succesMessage.value = response.data.message
    setTimeout(() => {
      succesMessage.value = ''
      FromOTP('password')
    }, 800)

  } catch (error: unknown) {
    const status = (error as { response?: { status?: number; data?: { message?: string } } }).response
    errorMessage.value = status?.data?.message || 'Something went wrong. Please try again.'
    console.error('OTP Verification failed:', error)
  }
}

const ResendOTP = async (empNo: string, email: string) => {
  try {
    console.log('resend')
    errorMessage.value = ''
    const response = await authApi.ResendOTP(empNo, email);
    if (!response.data.success) {
      errorMessage.value = response.data.message
    }
    errorMessage.value = ''
    succesMessage.value = response.data.message;
    setTimeout(() => {
      succesMessage.value = ''
    }, 1500);
  } catch (error) {
    console.error(`Resending OTP failed: `, error);
  }
}


const SubmitPassword = async  (data: {email: string, empNo: string, password: string}) => {
  console.log('submit')
  try {
    errorMessage.value = ''
    const response = await authApi.PasswordUpdate(data.empNo, data.email.toLowerCase(), data.password);
    if (!response.data.success) {
      errorMessage.value = response.data.message
    }
    errorMessage.value = ''
    succesMessage.value = response.data.message
    setTimeout(() => {
      step.value = 'login'
    }, 5000);



  } catch (error) {
    console.error(`Error saving password: ${error}`);
  }
}

const FromOTP = (v: string ) => {
  step.value = v
}

const onForgotPassword = async (data: { employeeNo: string; email: string }) => {
  try {
    errorMessage.value = ''
    const response = await authApi.RequestOTP(data.employeeNo, data.email)
    if (response.data.success) {
      email.value = data.email
      empNo.value = data.employeeNo
      flowSource.value = 'forgot'
      step.value = 'otp'   // reuses your existing OTP step
    } else {
      errorMessage.value = response.data.message || 'Failed to send OTP.'
    }
 } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status
    errorMessage.value =
      status === 400 || status === 401 || status === 404
        ? 'We could not find an account matching those details.'
        : 'Something went wrong. Please try again.'
    console.error('Forgot password error:', error)
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
