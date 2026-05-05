<template>
  <!-- Success Message View -->
  <div v-if="isRegistered" class="text-center pa-4">
    <v-icon color="success" size="80" class="mb-4">mdi-email-check-outline</v-icon>
    <h3 class="text-h5 font-weight-bold mb-2">Registration Successful!</h3>
    <p class="text-body-1 text-grey-darken-1 mb-6">
      We've sent a verification code to <strong>{{ formData.email }}</strong>. Please check your inbox for the **OTP**.
    </p>
    <v-btn color="primary" variant="outlined" rounded block @click="$emit('switch')">
      Back to Login
    </v-btn>
  </div>

  <!-- Registration Form View -->
  <v-form v-else @submit.prevent="handleRegister">
    <v-card-title class="text-h6 font-weight-bold mb-4 text-center">
      CREATE ACCOUNT
    </v-card-title>

    <v-card-subtitle class="mb-6 text-center">
      Enter your details to receive your registration OTP.
    </v-card-subtitle>
    <v-alert v-if="errors.general" type="error" variant="tonal" class="mb-4">
      {{ errors.general }}
    </v-alert>
    <v-text-field
      v-model="formData.employeeNo"
      label="Employee No."
      prepend-inner-icon="mdi-account-card-outline"
      variant="outlined"
      rounded
      density="comfortable"
      class="mb-2"
      required
    />

    <!-- Added Email Field -->
    <v-text-field
      v-model="formData.email"
      label="Email Address"
      type="email"
      prepend-inner-icon="mdi-email-outline"
      variant="outlined"
      rounded
      :error-messages="errors.email"
      density="comfortable"
      class="mb-2"
      required
    />

   <v-text-field
      v-model="formData.dob"
      label="Birth Date"
      placeholder="MM-DD-YYYY"
      hint="Format: Month-Day-Year"
      persistent-hint
      maxlength="10"
      :error-messages="errors.dob"
      variant="outlined"
      rounded
      density="comfortable"
      @input="handleDateInput"
    />

    <v-btn
      type="submit"
      color="success"
      block
      rounded
      class="mb-4"
      :loading="loading"
      :disabled="!isValid || loading"
    >
      Register
    </v-btn>

    <div class="text-center">
      <span class="text-body-2">Already have an account? </span>
      <v-btn variant="text" color="primary" class="pa-0" @click="$emit('switch')">
        Sign in instead
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { debounce } from 'perfect-debounce'
import authApi from '@/Api/Auth'

const emit = defineEmits(['switch', 'register'])
const loading = ref(false)
const isRegistered = ref(false)

const formData = reactive({
  employeeNo: '',
  email: '',
  dob: '',
})

const errors = reactive({
  employeeNo: '',
  email: '',
  dob: '',
  general: '',
})
const isValid = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/

const formatToApiDate = (dateStr: string) => {
  const [month, day, year] = dateStr.split('-')
  return `${year}-${month}-${day}`
}

const handleDateInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '') // Remove all non-digits

  if (value.length > 2 && value.length <= 4) {
    value = `${value.slice(0, 2)}-${value.slice(2)}`
  } else if (value.length > 4) {
    value = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4, 8)}`
  }

  formData.dob = value
}

const debouncBack = debounce(async () => {
  loading.value = true
  errors.general = ''

  try {
    const response = await authApi.CheckEmployee(formData.employeeNo, formatToApiDate(formData.dob), formData.email)
    if (response.data.exists) {
      errors.general = 'Employee already exists with the provided details.'
      isValid.value = false
    } else {
      errors.general = ''
      isValid.value = true
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };

    errors.general = err.response?.data?.message || 'An unexpected error occurred';
    console.error('Validation Error:', err);
  } finally {
      loading.value = false
  }
}, 800, { leading: false })


const handleRegister = async () => {
  loading.value = true
  try {
    emit('register', { ...formData })
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => ({ ...formData }),
  (newVal) => {
    if (newVal.employeeNo && newVal.email && newVal.dob) {
      if (!emailRegex.test(newVal.email)) {
        errors.email = 'Please enter a valid email address.'
        isValid.value = false
        return
      } else {
        errors.email = ''
      }

      if (!dateRegex.test(newVal.dob)) {
        errors.dob = 'Please enter a valid date in MM-DD-YYYY format.'
        isValid.value = false
        return
      } else {
        errors.dob = ''
      }

      debouncBack()
    } else {
      isValid.value = false
    }
  },
  { deep: true }
)
</script>

