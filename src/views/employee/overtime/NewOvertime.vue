<template>
  <v-container max-width="800" class="pb-6">
    <v-card class="elevation-3 d-flex flex-column" max-height="90vh">
      <v-card-title class="bg-primary text-white d-flex align-center py-3 px-6">
        <v-icon icon="mdi-clock-time-four" color="white" class="me-2" />
        {{ isEditMode ? 'Edit Overtime' : 'File New Overtime' }}
      </v-card-title>
      <v-card-text class="overflow-y-auto pa-6 pt-2">
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

        <v-form @submit.prevent="handleSave" ref="overtimeForm" v-model="isFormValid">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.ot_date"
                label="Date of Overtime"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[(v: any) => !!v || 'Overtime Date is required']"
                :readonly="isEditMode"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="formData.shift_code"
                :items="shiftOptions"
                label="Shift Code"
                readonly="true"
                variant="outlined"
                density="comfortable"
              ></v-select>
            </v-col>
          </v-row>

          <!-- <v-divider class="mb-4 mt-2"></v-divider> -->

          <!-- <h3 class="text-subtitle-1 font-weight-medium mb-2 text-primary">Advance Time</h3>
          <v-row>
            <v-col cols="12" sm="6" class="py-2">
              <v-text-field
                v-model="formData.adv_time_in"
                label="Advance Time In"
                type="time"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="py-2">
              <v-text-field
                v-model="formData.adv_time_out"
                label="Advance Time Out"
                type="time"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row> -->

          <v-divider class="mb-4 mt-2"></v-divider>

          <h3 class="text-subtitle-1 font-weight-medium mb-2 text-primary">Regular Overtime</h3>
          <v-row>
            <v-col cols="12" sm="6" class="py-2">
              <v-text-field
                v-model="formData.ot_time_in"
                label="Overtime Time In"
                type="time"
                variant="outlined"
                density="comfortable"
                :rules="otTimeInRules"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="py-2">
              <v-text-field
                v-model="formData.ot_time_out"
                label="Overtime Time Out"
                type="time"
                variant="outlined"
                density="comfortable"
                :rules="otTimeOutRules"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="mb-4 mt-2"></v-divider>

          <h3 class="text-subtitle-1 font-weight-medium mb-2 text-primary">Break Time</h3>
          <v-row>
            <v-col cols="12" sm="6" class="py-2">
              <v-text-field
                v-model="formData.ot_brktime_out"
                label="Break Time Out (Start Break)"
                type="time"
                variant="outlined"
                density="comfortable"
                clearable
                :rules="breakTimeOutRules"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="py-2">
              <v-text-field
                v-model="formData.ot_brktime_in"
                label="Break Time In (End Break)"
                type="time"
                variant="outlined"
                density="comfortable"
                clearable
                :rules="breakTimeInRules"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-end gap-2">
              <v-btn @click="handleClose" color="grey-darken-1" variant="text">Cancel</v-btn>
              <v-btn
                :disabled="!canSubmit"
                color="primary"
                type="submit"
                prepend-icon="mdi-content-save"
              >
                {{ isEditMode ? 'Update Overtime' : 'Save Overtime' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Api from '@/Api/Attendance'

interface Shift {
  shift_code: string
  time_in: string
  time_out: string
  time_in_2nd: string | null
  time_out_2nd: string | null
  xover: number
  brk_1_hr: number
}

interface ShiftSelect {
  value: string
  title: string
}

interface OvertimeRecord {
  ot_date: string
  adv_time_in: string | null
  adv_time_out: string | null
  ot_time_in: string | null
  ot_time_out: string | null
  ot_brktime_out: string | null
  ot_brktime_in: string | null
  shift_code?: string
}

const emit = defineEmits(['close', 'saved'])
const authStore = useAuthStore()
const isFormValid = ref(false)
const errorMessage = ref('')
const overtimeForm = ref<HTMLFormElement | null>(null)
const shiftOptions = ref<ShiftSelect[]>([])
const shifts = ref<Shift[]>([])
const timeIn = ref('')
const timeOut = ref('')

const props = defineProps<{ editData: OvertimeRecord | null }>()
const isEditMode = computed(() => !!props.editData)

// Reactive form object holding all the fields
const formData = ref({
  ot_date: '',
  shift_code: '',
  adv_time_in: '',
  adv_time_out: '',
  ot_time_in: '',
  ot_time_out: '',
  ot_brktime_out: '',
  ot_brktime_in: '',
})

const handleClose = () => {
  errorMessage.value = ''
  emit('close')
}

const formatForDateInput = (rawDate: string | null) => {
  if (!rawDate) return ''
  return rawDate.split(' ')[0].split('T')[0]
}

const formatForTimeInput = (rawTime: string | null) => {
  if (!rawTime) return ''
  const timePart = rawTime.includes('T') ? rawTime.split('T')[1] : rawTime.split(' ')[1]
  if (timePart) {
    return timePart.substring(0, 5)
  }
  return ''
}

onMounted(async () => {
  await fetchShifts()

  if (props.editData) {
    formData.value.ot_date = formatForDateInput(props.editData.ot_date)
    formData.value.adv_time_in = formatForTimeInput(props.editData.adv_time_in)
    formData.value.adv_time_out = formatForTimeInput(props.editData.adv_time_out)
    formData.value.ot_time_in = formatForTimeInput(props.editData.ot_time_in)
    formData.value.ot_time_out = formatForTimeInput(props.editData.ot_time_out)
    formData.value.ot_brktime_out = formatForTimeInput(props.editData.ot_brktime_out)
    formData.value.ot_brktime_in = formatForTimeInput(props.editData.ot_brktime_in)
  }
})

const formatTimeDisplay = (timeString: string | null | undefined) => {
  if (!timeString) return '-'
  // Handle both raw DB formats and formatted 'HH:mm' inputs
  const timeToParse = timeString.length <= 5 ? `1970-01-01T${timeString}:00` : timeString
  return new Date(timeToParse).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const fetchShifts = async () => {
  try {
    const res = await Api.Shifts(authStore.accessToken)
    const rawData = res.data.shiftCode
    shiftOptions.value = rawData.map((shift: Shift) => ({
      value: shift.shift_code,
      title: `${shift.shift_code} | ${formatTimeDisplay(shift.time_in)} - ${formatTimeDisplay(shift.time_out)}
              ${
                shift.time_in_2nd
                  ? ` | ${formatTimeDisplay(shift.time_in_2nd)} - ${formatTimeDisplay(shift.time_out_2nd)}`
                  : ''
              }`,
    }))
    shifts.value = rawData
  } catch (error) {
    console.error('Failed to fetch shifts:', error)
  }
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

const hasTimeEntries = computed(() => {
  const hasAdvanceOT = !!(formData.value.adv_time_in || formData.value.adv_time_out)
  const hasRegularOT = !!(formData.value.ot_time_in || formData.value.ot_time_out)

  return hasAdvanceOT || hasRegularOT
})

// Combines the Vuetify form validation (Date required) with your custom time requirement
const canSubmit = computed(() => {
  return isFormValid.value && hasTimeEntries.value
})

const handleSave = () => {
  try {
    errorMessage.value = ''
    const dateFrom = authStore.payrollInit?.pay_fr ?? ''
    const dateTo = authStore.payrollInit?.pay_to ?? ''
    if (formData.value.ot_date < dateFrom || formData.value.ot_date > dateTo) {
      errorMessage.value = `Validation Failed: Overtime date must be between ${formatDate(dateFrom)} and ${formatDate(dateTo)}}.`
      return
    }

    emit('saved', formData.value, isEditMode.value)
  } catch (error) {
    console.log(error)
  }
}

const setShiftCode = async (date: string) => {
  try {
    const res = await Api.EmployeeShift(authStore.accessToken, date)
    formData.value.shift_code = res.data.shiftCode.shift_code

    const shiftDetails = shifts.value.find(
      (shift) => shift.shift_code === res.data.shiftCode.shift_code,
    )
    if (shiftDetails) {
      timeIn.value = formatForTimeInput(shiftDetails.time_in)
      timeOut.value = formatForTimeInput(shiftDetails.time_out_2nd ?? shiftDetails.time_out)
    }
  } catch (error) {
    console.log(error)
  }
}

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const calculateTimeDiff = (start: string, end: string) => {
  const startMins = timeToMinutes(start)
  let endMins = timeToMinutes(end)
  // Handle crossing midnight
  if (endMins < startMins) {
    endMins += 24 * 60
  }
  return endMins - startMins
}

const otTimeInRules = [
  (v: string) => {
    if (!v || !timeOut.value) return true
    const otMins = timeToMinutes(v)
    const outMins = timeToMinutes(timeOut.value)

    // Checks if OT is before Timeout.
    // The second condition prevents false errors for overnight shifts (e.g., Timeout 23:00, OT 01:00)
    if (otMins < outMins && outMins - otMins < 12 * 60) {
      return `Must start at or after schedule timeout (${formatTimeDisplay(timeOut.value)})`
    }
    return true
  },
]

const otTimeOutRules = [
  (v: string) => {
    if (!v) return true
    if (!formData.value.ot_time_in) return 'Please set Time In first'

    const startMins = timeToMinutes(formData.value.ot_time_in)
    const endMins = timeToMinutes(v)

    // Strict same-day check: End time must be strictly greater than Start time
    if (endMins <= startMins) {
      return 'Time Out must be after Time In (Check AM/PM)'
    }

    return true
  },
]

const breakTimeOutRules = [
  (v: string) => {
    if (!v) return true // Break is optional
    if (!formData.value.ot_time_in) return 'Set Overtime Time In first'
    const diff = calculateTimeDiff(formData.value.ot_time_in, v)
    if (diff < 60) return 'Break must start at least 1 hour after Overtime In'
    return true
  },
]

const breakTimeInRules = [
  (v: string) => {
    if (!v && !formData.value.ot_brktime_out) return true // Both empty is fine
    if (!v && formData.value.ot_brktime_out) return 'Please set Break Time In'
    if (v && !formData.value.ot_brktime_out) return 'Please set Break Time Out first'

    const diff = calculateTimeDiff(formData.value.ot_brktime_out, v)
    if (diff !== 15 && diff !== 30) {
      return `Break must be exactly 15 or 30 mins (Current: ${diff} mins)`
    }
    return true
  },
]

watch(
  () => formData.value.ot_date,
  (newDate) => {
    if (newDate) setShiftCode(newDate)
  },
  { immediate: true },
)
</script>

<style scoped>
/* Adds a small gap between the cancel and save buttons */
.gap-2 {
  gap: 8px;
}
</style>
