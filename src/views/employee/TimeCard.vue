<template>
  <v-container class="pa-6" elevation="2" rounded="lg">
    <!-- Header -->
    <v-card class="rouneded-2xl pa-6 elevation-2">
      <v-card-title>
        <v-row align="center" justify="space-between" class="mb-6">
          <v-col cols="12" md="6">
            <h2 class="text-h5 font-weight-bold">Timecard</h2>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end">
            <v-select
              v-model="cutOff"
              :items="cutOffs"
              item-title="cutoff"
              item-value="init_cd"
              label="Select Cutoff"
              outlined
              dense
              @update:model-value="getTimeCard"
            ></v-select>
          </v-col>
        </v-row>
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn v-if="pdfBlob" color="primary" class="mt-3" @click="downloadPDF">
              Download TimeCard
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <!-- PDF display -->
      <v-card-text class="d-flex justify-center">
        <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="600px" frameborder="0"></iframe>
      </v-card-text>
    </v-card>
    <!-- 🔥 Loading Dialog -->
    <v-dialog v-model="loading" persistent width="300">
      <v-card class="pa-6 d-flex flex-column align-center">
        <v-progress-circular indeterminate size="40" />
        <p class="mt-4 text-center">Generating Time Card...</p>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import timeCardApi from '@/Api/TimeCard'
import { useAuthStore } from '@/stores/auth'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'
import Pdf from 'vue3-pdfjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const cutOff = ref('')
const cutOffs = ref([])
const authStore = useAuthStore()
const pdfBlob = ref<Blob | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const loading = ref<Boolean>(false)
const pdfUrl = ref('')

onMounted(async () => {
  await fetchCutOffs()
})

const fetchCutOffs = async () => {
  try {
    const result = await timeCardApi.GetCutoffs(authStore.accessToken)
    if (!result) {
      console.log('Error: no cutoffs found')
      return
    }
    cutOffs.value = result.data.result
  } catch (error) {
    console.log(error)
  }
}

const getTimeCard = async (code: string) => {
  try {
    loading.value = true
    const employeeNo = authStore.getUser?.employeeNo || ''
    const response = await timeCardApi.GetEmployeeAttendace(
      employeeNo,
      code,
      authStore.accessToken,
      'pdf',
    )

    pdfBlob.value = new Blob([response.data], { type: 'application/pdf' })
    pdfUrl.value = URL.createObjectURL(pdfBlob.value)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const downloadPDF = () => {
  if (!pdfBlob.value) return

  const url = URL.createObjectURL(pdfBlob.value)
  const link = document.createElement('a')
  link.href = url
  link.download = `TimeCard-${authStore.employee?.employeeNo}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>
