<template>
  <div>
    <p class="text-h6 font-weight-bold mb-1">Forgot password</p>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Enter your employee number and email to receive an OTP.
    </p>

    <v-form ref="formRef" v-model="isFormValid">
      <v-text-field
        v-model="form.employeeNo"
        label="Employee number"
        variant="outlined"
        density="comfortable"
        class="mb-3"
        :rules="[(v: string) => !!v || 'Required']"
      />
      <v-text-field
        v-model="form.email"
        label="Email address"
        type="email"
        variant="outlined"
        density="comfortable"
        class="mb-4"
        :rules="[
          (v: string) => !!v || 'Required',
          (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email'
        ]"
      />

      <v-btn block color="primary" :loading="loading" :disabled="!isFormValid" @click="submit">
        Send OTP
      </v-btn>
    </v-form>

    <div class="text-center mt-4">
      <a class="text-body-2 text-primary" style="cursor:pointer" @click="emit('switch', 'login')">
        Back to login
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { VForm } from 'vuetify/components'

const emit = defineEmits<{
  (e: 'submit', data: { employeeNo: string; email: string }): void
  (e: 'switch', step: string): void
}>()

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const isFormValid = ref(false)
const loading = ref(false)
const form = reactive({ employeeNo: '', email: '' })

const submit = async () => {
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) return
  loading.value = true
  emit('submit', { employeeNo: form.employeeNo, email: form.email })
  loading.value = false
}
</script>
