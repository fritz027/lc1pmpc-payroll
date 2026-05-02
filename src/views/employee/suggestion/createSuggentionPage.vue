<template>
  <v-container>
    <v-card class="rounded-2xl pa-6 elevation-2">
      <v-card-title class="bg-primary text-white d-flex align-center py-3 px-6">
        <v-icon icon="mdi-lightbulb-on" start />
        <span class="text-h6 font-weight-semibold">New Suggestion</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="white" @click="onClose" />
      </v-card-title>
      <v-form ref="formRef" @submit.prevent="onSubmit">
        <v-text-field v-model="title" label="Title" :rules="[rules.required]" required />
        <v-textarea
          clear-icon="mdi-close-circle"
          v-model="suggestion"
          label="Suggestion"
          :rules="[rules.min, rules.required]"
          clearable
        ></v-textarea>
      </v-form>
      <v-file-input v-model="files" label="Upload Files" accept="image/*" show-size />
      <div class="my-8">
        <v-row justify="center">
          <v-btn color="primary" @click="onSubmit"> Save Suggestion </v-btn>
        </v-row>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VForm } from 'vuetify/components/VForm'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import employeeApi from '@/Api/Employee'

const authStore = useAuthStore()
const router = useRouter()
const formRef = ref<VForm>()
const title = ref<string>('')
const suggestion = ref<string>('')
const files = ref<File>()

const rules = {
  required: (v: string) => !!v?.length || 'This field is required',
  min: (v: string) => v.length >= 20 || 'Must be at least 20 characters',
}

const onSubmit = async () => {
  if (files.value) {
    console.log(files.value)
  }
  const validationResult = await formRef.value?.validate()
  if (validationResult && validationResult.valid) {
    const formData = new FormData()
    formData.append('employeeNo', authStore.employee?.employeeNo || '')
    formData.append('title', title.value || '')
    formData.append('suggestion', suggestion.value)
    formData.append('module', 'suggestion')
    if (files.value) {
      formData.append('suggestionFile', files.value)
    }
    try {
      const result = await employeeApi.NewEmployeeSuggestions(authStore.accessToken, formData)
      if (result.data.success) {
        console.log(result.data.message)
        router.push('/suggestions')
      } else {
        console.log(result.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  } else {
    console.log('Form is invalid or validation failed')
  }
}

const onClose = () => {
  router.push('/suggestions')
}
</script>
