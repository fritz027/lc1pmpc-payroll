<template>
  <v-container>
    <v-card class="rounded-2xl pa-6 elevation-2">
      <v-card-title class="text-h6 font-weight-semibold mb-4">
        <v-row align="center" justify="space-between" class="w-100">
          <span class="text-h6 font-weight-semibold">Create Announcement</span>
          <v-btn icon="mdi-close" variant="text" color="grey-darken-1" @click="onClose" />
        </v-row>
      </v-card-title>
      <v-form ref="formRef" @submit.prevent="onSubmit">
        <v-text-field v-model="title" label="Title" :rules="[rules.required]" required />

        <v-file-input
          v-model="files"
          label="Upload Files"
          accept="image/*,.pdf"
          multiple
          :rules="[rules.required]"
          required
          show-size
        />

        <div v-if="previews.length" class="mt-4">
          <v-row justify="center" align="center" dense>
            <v-col
              v-for="(preview, index) in previews"
              :key="index"
              cols="12"
              class="d-flex justify-center"
            >
              <v-img
                :src="preview.url"
                max-width="400"
                :alt="preview.type === 'pdf' ? 'PDF Preview' : 'Image Preview'"
              />
            </v-col>
          </v-row>
        </div>
      </v-form>
      <div class="my-8">
        <v-row justify="center">
          <v-btn color="primary" @click="onSubmit"> Save Announcement </v-btn>
        </v-row>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { VForm } from 'vuetify/components/VForm'
import { useRouter } from 'vue-router'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'
import { useAuthStore } from '@/stores/auth'
import adminApi from '@/Api/Admin'

// ✅ Setup PDF.js worker only once
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const authStore = useAuthStore()
const router = useRouter()
const formRef = ref<VForm>()
const title = ref<string>('')
const files = ref<File[]>([])
const previews = ref<{ type: 'image' | 'pdf'; url: string }[]>([])

const rules = {
  required: (v: string) => !!v?.length || 'This field is required',
}

// Watch for file changes
watchEffect(() => {
  // Use a IIFE (Immediately Invoked Function Expression) for async logic
  ;(async () => {
    const newFiles = files.value
    // Clear old previews
    previews.value = []

    // Ensure we have files before proceeding
    if (!newFiles || newFiles.length === 0) return

    for (const file of newFiles) {
      // Release any previous object URLs to prevent memory leaks
      // (Though the next assignment will overwrite them, it's good practice
      // to cleanup old ones if this component were to be unmounted.)

      if (file.type.startsWith('image/')) {
        previews.value.push({ type: 'image', url: URL.createObjectURL(file) })
      } else if (file.type === 'application/pdf') {
        const pdfUrl = await renderPdfFirstPage(file)
        if (pdfUrl) {
          previews.value.push({ type: 'pdf', url: pdfUrl })
        }
      }
    }
  })()
})

async function renderPdfFirstPage(file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport,
      canvas, // ✅ This is the missing property
    }).promise

    return canvas.toDataURL('image/png')
  } catch (err) {
    console.error('PDF render error:', err)
    return null
  }
}

const onSubmit = async () => {
  const validationResult = await formRef.value?.validate()
  if (validationResult && validationResult.valid) {
    const formData = new FormData()
    formData.append('announceBy', authStore.employee?.employeeNo || '')
    formData.append('title', title.value || '')
    formData.append('module', 'announcements')

    if (files.value && files.value.length > 0) {
      files.value.forEach((file: File) => {
        formData.append('contentFile', file)
      })
    }
    try {
      const result = await adminApi.NewAnnouncement(authStore.accessToken, formData)
      if (result.data.success) {
        console.log(result.data.message)
        router.push('/admin/announcements')
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
  router.push('/admin/announcements')
}
</script>
