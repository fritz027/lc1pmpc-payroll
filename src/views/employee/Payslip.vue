<template>
  <v-container class="py-4">
    <!-- Payslip UI -->
    <template v-if="viewPayslip">
      <v-card class="rounded-2xl pa-6 elevation-2">
        <v-card-title>
          <v-row align="center" justify="space-between" class="mb-6">
            <v-col cols="12" md="6">
              <h2 class="text-h5 font-weight-bold">Payslip</h2>
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-end">
              <v-select
                v-model="cutOff"
                :items="cutOffs"
                item-title="cutoff"
                item-value="init_cd"
                return-object
                label="Select Cutoff"
                outlined
                dense
                @update:model-value="getPaySlip"
              />
            </v-col>
          </v-row>
          <v-row justify="end">
            <v-col cols="auto">
              <v-btn v-if="pdfBlob" color="primary" class="mt-3" @click="downloadPDF">
                Download Payslip
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text class="d-flex justify-center">
          <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="600px" frameborder="0"></iframe>
        </v-card-text>
      </v-card>

      <!-- Loading Dialog -->
      <v-dialog v-model="loading" persistent width="300">
        <v-card class="pa-6 d-flex flex-column align-center">
          <v-progress-circular indeterminate size="40" />
          <p class="mt-4 text-center">Generating Payslip...</p>
        </v-card>
      </v-dialog>
    </template>
    <!-- Show Under Maintenance if disabled -->
    <v-card
      v-else
      class="rounded-2xl pa-6 elevation-2 d-flex justify-center align-center"
      height="200"
    >
      <h3 class="text-h6 font-weight-bold">Payslip viewing is currently not available.</h3>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import timeCardApi from '@/Api/TimeCard'
import emploteeApi from '@/Api/Employee'
import { useAuthStore } from '@/stores/auth'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'
import dayjs from 'dayjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const cutOff = ref<any>(null)
const cutOffs = ref([])
const authStore = useAuthStore()
const canvas = ref<HTMLCanvasElement | null>(null)
const loading = ref<boolean>(false)
const pdfBlob = ref<Blob | null>(null)
const pdfUrl = ref('')
const viewPayslip = ref<boolean>(false)

onMounted(async () => {
  await fetchCutOffs()
  await checkPaySlipAvailable()
})

const checkPaySlipAvailable = async () => {
  try {
    const payslipSetting = await emploteeApi.FetchPayslipSetting(authStore.accessToken)

    if (!payslipSetting.data.success) {
      viewPayslip.value = false
      return
    }

    const { dateFrom, dateTo, enable } = payslipSetting.data.setting

    // If disabled in settings, hide payslip
    if (!enable) {
      viewPayslip.value = false
      return
    }

    const today = dayjs()
    const from = dayjs(dateFrom) // expects YYYY-MM-DD format
    const to = dayjs(dateTo)

    // Check if today is in the range (inclusive)
    if (today.isAfter(from.subtract(1, 'day')) && today.isBefore(to.add(1, 'day'))) {
      viewPayslip.value = true
    } else {
      viewPayslip.value = false
    }
  } catch (error) {
    console.error('Error checking payslip availability:', error)
    viewPayslip.value = false
  }
}

const fetchCutOffs = async () => {
  try {
    const result = await timeCardApi.GetCutoffs(authStore.accessToken)
    if (!result) {
      console.log('Error: no cutoffs found')
    }
    cutOffs.value = result.data.result
  } catch (error) {
    console.log(error)
  }
}

const downloadPDF = () => {
  if (!pdfBlob.value) return

  const url = URL.createObjectURL(pdfBlob.value)
  const link = document.createElement('a')
  link.href = url
  link.download = `Payslip_${authStore.employee?.employeeNo}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const getPaySlip = async () => {
  try {
    loading.value = true
    const dtFrom = dayjs(cutOff.value.dateFrom, 'MM/DD/YYYY').format('YYYY-MM-DD')
    const dtTo = dayjs(cutOff.value.dateTo, 'MM/DD/YYYY').format('YYYY-MM-DD')
    const response = await emploteeApi.GetPaySlip(authStore.accessToken, {
      employeeNo: authStore.employee?.employeeNo ?? '',
      dateFrom: dtFrom,
      dateTo: dtTo,
      format: 'pdf',
    })

    pdfBlob.value = new Blob([response.data], { type: 'application/pdf' })
    pdfUrl.value = URL.createObjectURL(pdfBlob.value)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>
