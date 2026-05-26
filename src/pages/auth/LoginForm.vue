<template>
  <v-form @submit.prevent="handleLogin">
    <v-card-title class="text-h6 font-weight-bold mb-4 text-center">
      LC1PMPC EMPLOYEE LOGIN
    </v-card-title>

    <v-card-subtitle class="mb-6 text-center">
      Please sign-in to your account and start the adventure.
    </v-card-subtitle>

    <v-text-field
      v-model="employeeNo"
      label="Employee No."
      prepend-inner-icon="mdi-account"
      variant="outlined"
      rounded
      density="comfortable"
      class="mb-4"
    />

    <v-text-field
      v-model="password"
      label="Password"
      prepend-inner-icon="mdi-lock"
      variant="outlined"
      rounded
      density="comfortable"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="showPassword = !showPassword"
      class="mb-4"
    />

    <v-btn type="submit" color="primary" block rounded class="mb-4">Sign In</v-btn>

    <div class="text-center mt-3">
      <a class="text-body-2 text-primary" style="cursor:pointer" @click="$emit('forgot')">
        Forgot password?
      </a>
    </div>

    <div class="text-center">
      <span class="text-body-2">New on our platform? </span>
      <v-btn variant="text" color="primary" class="pa-0" @click="$emit('switch')">Register an account</v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['login', 'switch', 'forgot'])

const employeeNo = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = () => {
  emit('login', { employeeNo: employeeNo.value, password: password.value })
}
</script>
