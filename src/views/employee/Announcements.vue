<template>
  <v-container class="py-6" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="rounded-2xl pa-6 elevation-3">
          <v-card-title class="text-h5 font-weight-bold mb-4"> Announcements </v-card-title>

          <v-divider class="mb-4"></v-divider>

          <!-- Loop announcements -->
          <v-row v-for="item in announcements" :key="item.id" class="mb-6">
            <v-col cols="12">
              <v-card class="rounded-xl pa-4 elevation-2 border-lg border-info">
                <v-row align="start" justify="space-between" class="w-100 mb-5 py-2 px-3">
                  <v-col cols="8">
                    <h3 class="text-h6 font-weight-bold mb-3">Title: {{ item.title }}</h3>
                  </v-col>
                  <v-col cols="4" class="text-end">
                    <h5>Date: {{ formatDate(item.dateCreated) }}</h5>
                  </v-col>
                </v-row>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Handle each file -->
                  <template v-for="(file, i) in item.contentFile" :key="i">
                    <!-- IMAGE -->
                    <v-img
                      v-if="isImage(file)"
                      :src="file"
                      max-height="250"
                      cover
                      class="rounded-lg cursor-pointer mt-2 border-thin border-primary"
                      @click="openImage(file)"
                    />

                    <!-- PDF PREVIEW -->
                    <div
                      v-else-if="isPdf(file)"
                      class="rounded-xl bg-gray-500 border-thin border-info cursor-pointer flex items-center justify-center h-64 mt-2"
                      @click="openPdf(file)"
                    >
                      <canvas :id="'pdf-thumb-' + item.id + '-' + i"></canvas>
                    </div>
                  </template>
                </div>
                <div class="row mt-3">
                  <div col cols="12">
                    <h5>Posted by: {{ item.announceBy }}</h5>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- IMAGE FULLSCREEN VIEW -->
    <v-dialog v-model="showImageDialog" max-width="900">
      <v-card class="rounded-xl pa-3">
        <v-img :src="activeImage" contain max-height="80vh" />
      </v-card>
    </v-dialog>

    <!-- PDF FULLSCREEN VIEW -->
    <v-dialog v-model="showPdfDialog" max-width="900">
      <v-card class="rounded-xl pa-3">
        <canvas id="pdf-fullscreen"></canvas>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import emloyeeApi from '@/Api/Employee'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'
import dayjs from 'dayjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

interface Announcements {
  id: number
  title: string
  status: string
  dateCreated: string
  date: string
  contentFile: string[]
  dateUpdated: string
  editedBy: string
  announceBy: string
}

const announcements = ref<Announcements[]>([])
const authStore = useAuthStore()
// Detect file type
const isImage = (file: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
const isPdf = (file: string) => /\.pdf$/i.test(file)

// Fetch announcements
onMounted(async () => {
  const response = await emloyeeApi.fetchAnnouncements(authStore.accessToken)

  announcements.value = response.data.announcements.map((item: any) => {
    // Force contentFile to always be an array
    const files = Array.isArray(item.contentFile) ? item.contentFile : [item.contentFile]

    return { ...item, contentFile: files }
  })

  // Generate PDF thumbnails
  nextTick(() => {
    announcements.value.forEach((item) => {
      item.contentFile.forEach((file: string, i: number) => {
        if (isPdf(file)) {
          renderPdfThumb(file, `pdf-thumb-${item.id}-${i}`)
        }
      })
    })
  })
})
onMounted(async () => {
  const response = await emloyeeApi.fetchAnnouncements(authStore.accessToken)

  announcements.value = response.data.announcements.map((item: any) => {
    // Force contentFile to always be an array
    const files = Array.isArray(item.contentFile) ? item.contentFile : [item.contentFile]

    return { ...item, contentFile: files }
  })

  // Generate PDF thumbnails
  nextTick(() => {
    announcements.value.forEach((item) => {
      item.contentFile.forEach((file: string, i: number) => {
        if (isPdf(file)) {
          renderPdfThumb(file, `pdf-thumb-${item.id}-${i}`)
        }
      })
    })
  })
})

/* -----------------------------
   IMAGE FULLSCREEN VIEW
-------------------------------- */
const showImageDialog = ref(false)
const activeImage = ref('')
const openImage = (file: string) => {
  activeImage.value = file
  showImageDialog.value = true
}

/* -----------------------------
   PDF FULLSCREEN VIEW
-------------------------------- */
const showPdfDialog = ref(false)
const activePdf = ref('')

const openPdf = (file: string) => {
  activePdf.value = file
  showPdfDialog.value = true
  nextTick(() => renderFullPdf(file))
}

/* -----------------------------
   PDF RENDER FUNCTIONS
-------------------------------- */
const renderPdfThumb = async (url: string, canvasId: string) => {
  const loadingTask = pdfjsLib.getDocument(url)
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 0.35 })

  const canvas: any = document.getElementById(canvasId)
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: ctx, viewport, canvas }).promise
}

const renderFullPdf = async (url: string) => {
  const loadingTask = pdfjsLib.getDocument(url)
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 1.3 })

  const canvas: any = document.getElementById('pdf-fullscreen')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: ctx, viewport, canvas }).promise
}

const formatDate = (date: string) => {
  return dayjs(date).format('MMMM DD, YYYY')
}
</script>
