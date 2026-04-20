<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold mb-1">Overtime Authorization</h2>
        <div
          class="bg-blue-lighten-5 text-blue-darken-3 px-2 py-1 rounded text-caption d-inline-flex align-center"
        >
          <v-icon size="x-small" class="mr-1">mdi-information</v-icon>
          Select a payroll period to view overtime records.
        </div>
      </v-col>

      <v-col cols="12" md="6" class="text-md-right">
        <v-btn @click="FileOvertime" color="primary" prepend-icon="mdi-plus">File Overtime</v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2">
      <div class="overflow-x-auto">
        <v-data-table
          :headers="headers"
          :items="overtimeRecords"
          :loading="loading"
          hover
          class="text-no-wrap striped-table custom-table-border"
        >
          <template v-slot:[`item.ot_date`]="{ item }">
            {{ formatDate(item.ot_date) }}
          </template>

          <!-- <template v-slot:item.adv_time_in="{ item }">
            {{ formatTime(item.adv_time_in) }}
          </template> -->

          <template v-slot:[`item.ot_time_in`]="{ item }">
            {{ formatTime(item.ot_time_in) }}
          </template>

          <template v-slot:[`item.ot_brktime_out`]="{ item }">
            {{ formatTime(item.ot_brktime_out) }}
          </template>

          <template v-slot:[`item.ot_time_out`]="{ item }">
            {{ formatTime(item.ot_time_out) }}
          </template>

          <template v-slot:[`item.ot_brktime_in`]="{ item }">
            {{ formatTime(item.ot_brktime_in) }}
          </template>



          <!-- <template v-slot:item.adv_time_out="{ item }">
            {{ formatTime(item.adv_time_out) }}
          </template> -->

          <template v-slot:[`item.apprvd`]="{ item }">
            <v-chip :color="item.apprvd === 1 ? 'success' : 'warning'" size="small" variant="flat">
              {{ item.apprvd === 1 ? 'Approved' : 'Pending' }}
            </v-chip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex gap-1 align-center">
              <template v-if="item.apprvd !== 1">
                <v-tooltip text="Edit Overtime" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil"
                      variant="text"
                      color="blue-grey-darken-1"
                      size="small"
                      @click="editOvertime(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </template>
              <template v-if="item.apprvd !== 1">
                <v-tooltip text="Edit Overtime" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-trash-can"
                      variant="text"
                      color="red-darken-1"
                      size="small"
                      @click="deleteOvertime(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </template>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="850px" persistent>
      <NewOvertime :edit-data="selectedItem" @close="onClose" @saved="onLeaveSaved" />
    </v-dialog>
    <v-snackbar v-model="errorSnack" color="error" location="top" timeout="3000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="errorSnack = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ovetimeApi from '@/Api/Overtime'
import NewOvertime from './NewOvertime.vue'

// Updated Interface matching your DB schema
interface OvertimeRecord {
  emp_no: string
  ot_date: string
  adv_time_in: string | null
  ot_time_in: string | null
  ot_brktime_out: string | null
  ot_brktime_in: string | null
  ot_time_out: string | null
  adv_time_out: string | null
  apprvd: number | null
  init_cd: string | null
  phalf: string | null
}

const loading = ref(false)
const overtimeRecords = ref<OvertimeRecord[]>([])
const authStore = useAuthStore()
const dialog = ref(false)
const errorMessage = ref('')
const errorSnack = ref(false)
const selectedItem = ref<OvertimeRecord | null>(null)

const openDialog = () => {
  dialog.value = true
}

const onClose = () => {
  dialog.value = false
}

const onLeaveSaved = async (newOvertimeData: OvertimeRecord, isEditMode: boolean) => {
  try {
    const payload = {
      ot_date: newOvertimeData.ot_date,
      adv_time_in: newOvertimeData.adv_time_in,
      adv_time_out: newOvertimeData.adv_time_out,
      ot_time_in: newOvertimeData.ot_time_in,
      ot_time_out: newOvertimeData.ot_time_out,
      ot_brktime_out: newOvertimeData.ot_brktime_out,
      ot_brktime_in: newOvertimeData.ot_brktime_in,
      init_cd: authStore.payrollInit?.init_cd ?? '',
      phalf: authStore.payrollInit?.phalf ?? '',
      apprvd: 0,
    }
    if (!isEditMode) {
      const isDuplicate = overtimeRecords.value.some((item: OvertimeRecord) => {
        const existingDate = item.ot_date ? item.ot_date.slice(0, 10) : ''
        return existingDate === newOvertimeData.ot_date
      })
      if (isDuplicate) {
        errorMessage.value = 'This overtime record already exists for the selected date.'
        errorSnack.value = true
        return
      }

      const res = await ovetimeApi.newOvertime(authStore.accessToken, payload)
      if (!res.data.success) {
        errorMessage.value = res.data.message
        errorSnack.value = true
        return
      }
    } else {
      const res = await ovetimeApi.updateOvertime(authStore.accessToken, payload)
      if (!res.data.success) {
        errorMessage.value = res.data.message
        errorSnack.value = true
        return
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    fetchOvertime()
    dialog.value = false
  }
}

const FileOvertime = () => {
  openDialog()
}

const editOvertime = (item: OvertimeRecord) => {
  console.log('Editing:', item.emp_no)
  selectedItem.value = item
  openDialog()
}

// Updated Vuetify Data Table Headers
const headers = [
  { title: 'Date', key: 'ot_date', align: 'start' },
  // { title: 'Adv In', key: 'adv_time_in' },
  // { title: 'Adv Out', key: 'adv_time_out' },
  { title: 'Time In', key: 'ot_time_in' },
  { title: 'Time Out', key: 'ot_time_out' },
  { title: 'Break Out', key: 'ot_brktime_out' },
  { title: 'Break In', key: 'ot_brktime_in' },
  { title: 'Status', key: 'apprvd', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

// Mock Fetch Function
const fetchOvertime = async () => {
  loading.value = true
  try {
    // Mock Data with new fields
    if (!authStore.payrollInit) return
    const res = await ovetimeApi.getEmployeeOvertimeList(
      {
        code: authStore.payrollInit?.init_cd ?? '',
        phalf: authStore.payrollInit?.phalf ?? '',
        dateFrom: formatDateOnly(authStore.payrollInit?.pay_fr) ?? null,
        dateTo: formatDateOnly(authStore.payrollInit?.pay_to) ?? null,
      },
      authStore.accessToken,
    )

    overtimeRecords.value = res.data.overtime
  } catch (error) {
    console.error('Failed to fetch overtime:', error)
  } finally {
    loading.value = false
  }
}

// Helper formatting functions
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateOnly = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const year = date.getFullYear()
  // getMonth() is 0-indexed, so we add 1. padStart ensures it's always 2 digits.
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatTime = (timeString: string | null) => {
  if (!timeString) return '-'
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const deleteOvertime = async (item: OvertimeRecord) => {
  try {
    if (!confirm('Are you sure you want to delete this overtime record?')) return
    const date = formatDateOnly(item.ot_date)
    if (!date) return

    const res = await ovetimeApi.deleteOvertime(authStore.accessToken, date)
    if (!res.data.success) {
      errorMessage.value = res.data.message
      errorSnack.value = true
      return
    }
    fetchOvertime()
  } catch (error) {
    console.error('Failed to delete overtime:', error)
  }
}

onMounted(() => {
  fetchOvertime()
})

watch(
  () => authStore.payrollInit,
  () => fetchOvertime(),
  { immediate: true },
)
</script>
