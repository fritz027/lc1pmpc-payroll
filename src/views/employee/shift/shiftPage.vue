<template>
  <v-container fluid class="pa-0">
    <v-card variant="flat" class="rounded-0 min-vh-100">
      <v-card-title class="d-flex align-center py-4 px-6">
        <v-icon icon="mdi-calendar-sync" class="mr-2" />
        Change Day-Off Request
        <v-spacer />
        <v-btn color="info" variant="tonal" prepend-icon="mdi-plus" @click="openNewDialog">
          New Request
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card elevation="2" class="rounded-lg border ma-4">
        <v-data-table
          :items="dayOffs"
          :headers="headers"
          :items-per-page="-1"
          hide-default-footer
          class="striped-table"
          hover
        >
          <template v-slot:item.ot_date="{ value }">
            <span class="font-weight-medium">{{ formatDateOnly(value) }}</span>
          </template>
          <template v-slot:item.time_from="{ value }">
            <span class="font-weight-medium">{{ formatTimeDisplay(value) }}</span>
          </template>
          <template v-slot:item.time_to="{ value }">
            <span class="font-weight-medium">{{ formatTimeDisplay(value) }}</span>
          </template>
          <template v-slot:item.hours="{ value }">
            <span class="font-weight-medium">{{ value ? Number(value).toFixed(2) : '0.00' }}</span>
          </template>
          <template v-slot:item.charge_to_date="{ value }">
            <span class="font-weight-medium">{{ formatDateOnly(value) }}</span>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip v-if="item.status === 'P'" color="warning" size="x-small" variant="flat">
              PENDING
            </v-chip>
            <v-chip v-else-if="item.status === 'A'" color="info" size="x-small" variant="flat">
              APPROVED
            </v-chip>
            <span v-else class="text-caption text-grey">-</span>
          </template>

          <template v-slot:item.actions="{ item }">
            <div
              v-if="isPosted"
              class="text-caption text-error font-weight-bold d-flex align-center justify-end"
            >
              <v-icon icon="mdi-lock" size="small" class="mr-1" />
              Payroll Posted
            </div>

            <div v-else-if="item.status === 'P'" class="d-flex justify-end" style="gap: 8px">
              <v-tooltip text="Edit Request" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil"
                    variant="text"
                    color="teal-darken-1"
                    size="small"
                    @click="openEditDialog(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Cancel Request" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-close-circle-outline"
                    variant="text"
                    color="error"
                    size="small"
                    @click="promptCancel(item)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="requestDialog" max-width="600" persistent>
        <v-card class="pa-2">
          <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
            {{ isEditing ? 'Edit Change Day-Off Request' : 'New Change Day-Off Request' }}
            <v-btn
              icon="mdi-close"
              variant="text"
              density="comfortable"
              @click="closeRequestDialog"
            ></v-btn>
          </v-card-title>
          <v-divider class="mb-4"></v-divider>

          <v-card-text>
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>
            <v-form @submit.prevent="submitRequest" v-model="isFormValid" ref="formRef">
              <v-row>
                <v-col cols="12" sm="6" class="py-1">
                  <v-text-field
                    v-model="formData.ot_date"
                    label="Date (OT Date)"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v: any) => !!v || 'Date is required']"
                    :disabled="isEditing"
                  ></v-text-field>
                </v-col>
                <!-- <v-col cols="12" sm="6" class="py-1">
                  <v-text-field
                    v-model="formData.charge_to_date"
                    label="Charge To Date (Optional)"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    clearable
                  ></v-text-field>
                </v-col> -->
              </v-row>

              <v-row>
                <v-col cols="12" sm="4" class="py-1">
                  <v-text-field
                    v-model="formData.time_from"
                    label="Time From"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v: any) => !!v || 'Time From is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" class="py-1">
                  <v-text-field
                    v-model="formData.time_to"
                    label="Time To"
                    type="time"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v: any) => !!v || 'Time To is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" class="py-1">
                  <v-text-field
                    v-model="formData.hours"
                    label="Hours"
                    type="text"
                    variant="outlined"
                    density="comfortable"
                    :rules="[
                      (v: any) => !!v || 'Hours required',
                      (v: any) => v > 0 || 'Must be > 0',
                    ]"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row class="mt-2">
                <v-col cols="12" class="d-flex justify-end" style="gap: 8px">
                  <v-btn
                    color="grey-darken-1"
                    variant="text"
                    @click="closeRequestDialog"
                    :disabled="submitting"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="info"
                    type="submit"
                    prepend-icon="mdi-content-save"
                    :loading="submitting"
                  >
                    {{ isEditing ? 'Update Request' : 'Submit Request' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="cancelDialog" max-width="400">
        <v-card>
          <v-card-title class="text-error font-weight-bold d-flex align-center">
            <v-icon icon="mdi-alert-circle" color="error" class="mr-2"></v-icon>
            Confirm Cancellation
          </v-card-title>
          <v-card-text class="pt-2">
            Are you sure you want to cancel this pending day-off request for
            <strong>{{ formatDateOnly(itemToCancel?.ot_date) }}</strong
            >?
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" variant="text" @click="cancelDialog = false"
              >No, Keep It</v-btn
            >
            <v-btn color="error" variant="flat" @click="confirmCancel" :loading="canceling"
              >Yes, Cancel It</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Api from '@/Api/Shift'
import { fa } from 'vuetify/locale'

export interface DayOffRequest {
  emp_no: string
  ot_date: string
  time_from: string
  time_to: string
  hours: number
  charge_to_date: string | null
  status?: 'P' | 'A' | 'C' | 'R'
  request_id?: number // Assuming you have an ID to cancel by
}

const authStore = useAuthStore()
const dayOffs = ref<DayOffRequest[]>([])
const isPosted = ref(false)

// Dialog States
const requestDialog = ref(false)
const cancelDialog = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const canceling = ref(false)
const isFormValid = ref(false)
const formRef = ref<any>(null)
const errorMessage = ref('')

const itemToCancel = ref<DayOffRequest | null>(null)

// Form State
const defaultForm = {
  ot_date: '',
  time_from: '',
  time_to: '',
  hours: '',
  charge_to_date: '',
}
const formData = ref({ ...defaultForm })

// Table Headers
const headers = [
  { title: 'OT Date', key: 'ot_date', align: 'start' as const },
  { title: 'Time From', key: 'time_from' },
  { title: 'Time To', key: 'time_to' },
  { title: 'Hours', key: 'hours', align: 'center' as const },
  { title: 'Charge To Date', key: 'charge_to_date' },
  { title: 'Status', key: 'status', align: 'center' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

// --- Formatters ---
const formatDateOnly = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const formatTimeDisplay = (timeString: string | null) => {
  if (!timeString) return '-'
  const timeToParse = timeString.length <= 5 ? `1970-01-01T${timeString}:00` : timeString
  return new Date(timeToParse).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    weekday: 'long', // "Monday"
    year: 'numeric', // "2026"
    month: 'short', // "Mar"
    day: 'numeric', // "11"
  })
}

const formatForTimeInput = (rawTime: string | null) => {
  if (!rawTime) return ''
  const timePart = rawTime.includes('T') ? rawTime.split('T')[1] : rawTime.split(' ')[1]
  return timePart ? timePart.substring(0, 5) : ''
}

// --- Data Fetching ---
const loadSchedule = async () => {
  try {
    const response = await Api.EmployeeChangeDayOffRequests(authStore.accessToken)
    dayOffs.value = response.data.dayOffRequests
  } catch (error) {
    console.error('Failed to load schedule', error)
  }
}

// --- Dialog Controls ---
const openNewDialog = () => {
  isEditing.value = false
  formData.value = { ...defaultForm }
  requestDialog.value = true
}

const openEditDialog = (item: DayOffRequest) => {
  isEditing.value = true
  formData.value = {
    ot_date: formatDateOnly(item.ot_date),
    time_from: formatForTimeInput(item.time_from),
    time_to: formatForTimeInput(item.time_to),
    hours: item.hours.toString(),
    charge_to_date:
      formatDateOnly(item.charge_to_date) === '-' ? '' : formatDateOnly(item.charge_to_date),
  }
  requestDialog.value = true
}

const closeRequestDialog = () => {
  requestDialog.value = false
  setTimeout(() => formRef.value?.resetValidation(), 200)
}

// --- Actions ---
const submitRequest = async () => {
  if (!isFormValid.value) return
  submitting.value = true

  const dateFrom = authStore.payrollInit?.pay_fr ?? ''
  const dateTo = authStore.payrollInit?.pay_to ?? ''
  if (formData.value.ot_date < dateFrom || formData.value.ot_date > dateTo) {
    errorMessage.value = `Validation Failed: Overtime date must be between ${formatDate(dateFrom)} and ${formatDate(dateTo)}}.`
    submitting.value = false
    return
  }

  try {
    const payload = {
      ...formData.value,
      hours: Number(formData.value.hours), // Ensure it sends as a number
    }

    // Since your backend uses `ON EXISTING UPDATE`, the same API call works for New and Edit!
    await Api.NewChangeDayOffRequest(payload, authStore.accessToken)

    closeRequestDialog()
    await loadSchedule()
  } catch (error) {
    console.error('Submission failed', error)
  } finally {
    submitting.value = false
  }
}

const promptCancel = (item: DayOffRequest) => {
  itemToCancel.value = item
  cancelDialog.value = true
}

const confirmCancel = async () => {
  if (!itemToCancel.value) return
  canceling.value = true

  try {
    // Assuming you have an ID to pass, or pass the date/emp_no combo
    await Api.CancelDayOffRequest(itemToCancel.value.ot_date, authStore.accessToken)

    cancelDialog.value = false
    await loadSchedule()
  } catch (error) {
    console.error('Failed to cancel request', error)
  } finally {
    canceling.value = false
  }
}

const calculateHours = (start: string, end: string) => {
  if (!start || !end) return ''

  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)

  let startTotalMins = startHour * 60 + startMin
  let endTotalMins = endHour * 60 + endMin

  // Handle shifts that cross midnight
  if (endTotalMins <= startTotalMins) {
    endTotalMins += 24 * 60
  }

  const diffMins = endTotalMins - startTotalMins
  const totalHours = diffMins / 60

  if (totalHours >= 5) {
    // Subtract 1 hour for break if shift is 5 hours or more
    return (totalHours - 1).toFixed(2)
  }
  return totalHours.toFixed(2)
}

watch(
  () => [formData.value.time_from, formData.value.time_to],
  ([newFrom, newTo]) => {
    if (newFrom && newTo) {
      formData.value.hours = calculateHours(newFrom, newTo)
    } else {
      // Clear the hours field if either time is cleared
      formData.value.hours = ''
    }
  },
)

// --- Watchers & Lifecycle ---
watch(
  () => [authStore.payrollInit?.pay_fr, authStore.payrollInit?.pay_to],
  ([newFrom, newTo]) => {
    if (newFrom && newTo) loadSchedule()
  },
  { immediate: true },
)

onMounted(loadSchedule)
</script>
