<template>
  <v-container>
    <v-card class="rounded-2xl pa-6 elevation-2">
      <v-card-title class="text-h6 font-weight-semibold mb-4">
        <v-row align="center" justify="space-between" class="w-100">
          <span class="text-h6 font-weight-semibold">Edit Announcement</span>
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
          :rules="[requiredIfNoPreview]"
          required
          show-size
        />

        <!-- Status -->
        <v-checkbox
          v-model="status"
          color="primary"
          :label="`Status: ${statusDescription}`"
          hide-details
          @update:modelValue="onStatusChange"
        />

        <!-- Previews -->
        <div v-if="previews.length" class="mt-4">
          <v-row justify="center" align="center" dense>
            <v-col
              v-for="(preview, index) in previews"
              :key="index"
              cols="12"
              class="d-flex flex-column align-center"
            >
              <!-- Image preview -->
              <img
                v-if="preview.type === 'image'"
                :src="preview.url"
                style="max-width: 400px; display: block"
                alt="Image Preview"
              />

              <!-- PDF preview (thumbnail) -->
              <img
                v-else-if="preview.type === 'pdf'"
                :src="preview.url"
                style="max-width: 400px; display: block"
                alt="PDF Preview"
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
import { ref, onMounted, watchEffect } from 'vue'
import { VForm } from 'vuetify/components/VForm'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminApi from '@/Api/Admin'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const formRef = ref<VForm>()
const title = ref<string>('')
const files = ref<File[]>([])
const previews = ref<{ type: 'image' | 'pdf'; url: string; originalUrl?: string }[]>([])
const id = route.params.id
const status = ref<Boolean>(false)
const statusDescription = ref<String>('')
const oldContentFile = ref<string>('')

const rules = {
  required: (v: any) => !!v?.length || 'This field is required',
}
const requiredIfNoPreview = (value: any[]) => {
  // If preview has images = no need to upload
  if (previews.value && previews.value.length > 0) {
    return true
  }

  // If preview empty, check files
  return (value && value.length > 0) || 'Please upload at least one file'
}
onMounted(async () => {
  try {
    const response = await adminApi.GetAnnouncementByID(authStore.accessToken, Number(id))
    const announcement = response.data.announcement[0]
    title.value = announcement.title
    const contentFile: string[] = JSON.parse(announcement.contentFile)
    oldContentFile.value = announcement.contentFile
    status.value = announcement.status === 'O' ? true : false
    statusDescription.value = announcement.status === 'O' ? 'OPEN' : 'DONE'
    previews.value = []

    if (!contentFile || contentFile.length === 0) return

    for (const url of contentFile) {
      if (url.endsWith('.pdf')) {
        try {
          const res = await fetch(url)
          const blob = await res.blob()
          const file = new File([blob], 'preview.pdf', { type: 'application/pdf' })
          const thumbnail = await renderPdfFirstPage(file)

          previews.value.push({
            type: 'pdf',
            url: thumbnail || url, // thumbnail if available, fallback to original
            originalUrl: url, // keep original for "Open PDF" button
          })
        } catch (err) {
          console.error('PDF fetch/render error:', err)
          previews.value.push({ type: 'pdf', url, originalUrl: url })
        }
      } else {
        previews.value.push({ type: 'image', url })
      }
    }
  } catch (error) {
    console.log('Error fetching announcement details:', error)
  }
})

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

    await page.render({ canvasContext: context, viewport, canvas }).promise

    return canvas.toDataURL('image/png')
  } catch (err) {
    console.error('PDF render error:', err)
    return null
  }
}

const onStatusChange = () => {
  if (status.value) {
    statusDescription.value = 'OPEN'
  } else {
    statusDescription.value = 'DONE'
  }
}

const onSubmit = async () => {
  const validationResult = await formRef.value?.validate()
  if (!validationResult?.valid) {
    console.log('Form is invalid')
    return
  }

  const formData = new FormData()
  const newStatus = status.value ? 'O' : 'D'
  formData.append('status', newStatus)
  formData.append('editedBy', authStore.employee?.employeeNo || '')
  formData.append('title', title.value)
  formData.append('oldContentFile', oldContentFile.value)
  formData.append('module', 'announcements')

  const newFiles = files.value
  if (newFiles && newFiles.length > 0) {
    console.log('test')
    newFiles.forEach((file: File) => {
      formData.append('contentFile', file)
    })
  }

  try {
    const result = await adminApi.EditAnnouncement(authStore.accessToken, Number(id), formData)
    if (result.data.success) {
      router.push('/announcements')
    } else {
      console.log(result.data.message)
    }
  } catch (error) {
    console.log(error)
  }
}

const onClose = () => {
  router.push('/announcements')
}
</script>
