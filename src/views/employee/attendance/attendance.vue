<template>
  <v-container max-width="1200">
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold mb-1">Attendance Records</h2>
        <div
          class="bg-teal-lighten-5 text-teal-darken-3 px-2 py-1 rounded text-caption d-inline-flex align-center"
        >
          <v-icon size="x-small" class="mr-1">mdi-calendar-clock</v-icon>
          Viewing current payroll period attendance.
        </div>
      </v-col>

      <v-col cols="12" md="6" class="text-md-right">
        <v-btn color="teal-darken-1" prepend-icon="mdi-plus" @click="openAddDialog">
          Add Attendance
        </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2">
      <div class="overflow-x-auto">
        <v-data-table
          :headers="headers"
          :items="attendanceRecords"
          :loading="loading"
          hover
          class="text-no-wrap striped-table custom-table-border"
        >
          <template v-slot:item.date_dt="{ item }">
            <span class="font-weight-medium">{{ formatDateDisplay(item.date_dt) }}</span>
          </template>

          <template v-slot:item.time_in="{ item }">
            {{ formatTimeDisplay(item.time_in) }}
          </template>
          <template v-slot:item.time_out="{ item }">
            {{ formatTimeDisplay(item.time_out) }}
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              class="font-weight-bold text-uppercase"
              >{{ item.status }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex justify-end" v-if="item.status = 'Pending'">
              <v-tooltip text="Delete Record" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-trash-can-outline"
                    variant="text"
                    color="deep-orange-darken-4"
                    size="small"
                    @click="deleteAttendance(item)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="800" persistent>
      <v-card class="pa-2 pa-sm-4">
        <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
          {{ isEditing ? 'Edit Attendance' : 'New Attendance Record' }}
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="closeDialog"></v-btn>
        </v-card-title>

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
          <v-form @submit.prevent="saveAttendance" v-model="isFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.date_dt"
                  label="Date"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  required
                  :rules="[(v: any) => !!v || 'Attendace Date is required']"
                  :disabled="isEditing"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.shift_code"
                  :items="shiftOptions"
                  item-title="title"
                  item-value="value"
                  label="Shift Code"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: any) => !!v || 'Shift Code is required']"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <v-divider class="mb-4 mt-2"></v-divider>

            <h3 class="text-subtitle-1 font-weight-medium mb-2 text-teal-darken-1">
              Standard Logs
            </h3>
            <v-row>
              <v-col cols="12" sm="6" class="py-2">
                <v-text-field
                  v-model="formData.time_in"
                  label="Time In"
                  type="time"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  :rules="[(v: any) => !!v || 'Attendance Time In is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="py-2">
                <v-text-field
                  v-model="formData.time_out"
                  label="Time Out"
                  type="time"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  :rules="[(v: any) => !!v || 'Attendance Time Out is required']"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="py-2">
                <v-textarea
                  v-model="formData.reason"
                  label="Reason for Change / Remarks"
                  placeholder="Please provide a reason for this manual entry or edit..."
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  auto-grow
                  prepend-inner-icon="mdi-comment-text-outline"
                  :rules="reasonRules"
                  required
                ></v-textarea>
              </v-col>
            </v-row>
            <v-divider class="mb-4 mt-2"></v-divider>

            <v-row class="mt-4">
              <v-col cols="12" class="d-flex justify-end" style="gap: 8px">
                <v-btn color="grey-darken-1" variant="text" @click="closeDialog">Cancel</v-btn>
                <v-btn color="teal-darken-1" type="submit" prepend-icon="mdi-content-save">
                  Save Record
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Api from '@/Api/Attendance'
import { useAuthStore } from '@/stores/auth'

interface AttendanceRecord {
  emp_no: string
  date_dt: string
  shift_code: string | null
  time_in: string | null
  time_out: string | null
  date_posted: string | null
  init_cd?: string | null
  phalf?: string | null
}

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

const authStore = useAuthStore()
const loading = ref(false)
const dialog = ref(false)
const isEditing = ref(false)
const shifts = ref<Shift[]>([])
const shiftOptions = ref<ShiftSelect[]>([])
const attendanceRecords = ref<AttendanceRecord[]>([])
const isFormValid = ref(false)
const errorMessage = ref('')

// Default empty form state
const defaultForm = {
  date_dt: '',
  shift_code: '',
  time_in: '',
  break_out: '',
  time_out: '',
  date_posted: '',
  init_cd: '',
  phalf: '',
  reason: '',
  status: 'Pending',
}

const formData = ref({ ...defaultForm })

const headers = [
  { title: 'Date', key: 'date_dt', align: 'start' },
  { title: 'Shift', key: 'shift_code' },
  { title: 'Time In', key: 'time_in' },
  { title: 'Time Out', key: 'time_out' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const reasonRules = [(v: string) => !!v || 'Reason is required']

// --- Formatting Helpers to prevent input errors ---
const formatForDateInput = (rawDate: string | null) => {
  if (!rawDate) return ''
  return rawDate.split(' ')[0].split('T')[0]
}

const formatForTimeInput = (rawTime: string | null) => {
  if (!rawTime) return ''
  const timePart = rawTime.includes('T') ? rawTime.split('T')[1] : rawTime.split(' ')[1]
  return timePart ? timePart.substring(0, 5) : ''
}

// Display formatters for the table
const formatDateDisplay = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTimeDisplay = (timeString: string | null | undefined) => {
  if (!timeString) return '-'
  // Handle both raw DB formats and formatted 'HH:mm' inputs
  const timeToParse = timeString.length <= 5 ? `1970-01-01T${timeString}:00` : timeString
  return new Date(timeToParse).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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

// --- Action Methods ---
const fetchAttendance = async () => {
  loading.value = true
  try {
    const from = formatDateOnly(authStore.payrollInit?.pay_fr ?? '')
    const to = formatDateOnly(authStore.payrollInit?.pay_to ?? '')
    if (!from || !to) return

    const res = await Api.AttendanceRecords(from, to, authStore.accessToken)
    console.log(res.data.attendance)
    attendanceRecords.value = res.data.attendance
  } catch (error) {
    console.error('Failed to fetch attendance:', error)
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEditing.value = false
  formData.value = { ...defaultForm }
  dialog.value = true
}

const editAttendance = (item: AttendanceRecord) => {
  isEditing.value = true
  // Format data perfectly for the native inputs
  // formData.value = {
  //   date_dt: formatForDateInput(item.date_dt),
  //   shift_code: item.shift_code || '',
  //   adv_time_in: formatForTimeInput(item.adv_time_in),
  //   time_in: formatForTimeInput(item.time_in),
  //   break_out: formatForTimeInput(item.break_out),
  //   break_in: formatForTimeInput(item.break_in),
  //   time_out: formatForTimeInput(item.time_out),
  //   adv_time_out: formatForTimeInput(item.adv_time_out)
  // }
  dialog.value = true
}

const deleteAttendance = async (item: AttendanceRecord) => {
  try {
    if (!item.date_dt || !item.shift_code) return

    const res = await Api.RemoveAttendanceRequest(
      authStore.accessToken,
      formatDateOnly(item.date_dt),
      item.shift_code ?? '',
    )
    if (!res.data.success) {
      alert(res.data.message)
      return
    }
    alert(res.data.message)
    fetchAttendance()
  } catch (error) {
    console.log(error)
  }
}

const closeDialog = () => {
  dialog.value = false
  formData.value = { ...defaultForm }
}

const saveAttendance = async () => {
  console.log('Payload for saving:', formData.value)
  if (!isFormValid.value) return

  errorMessage.value = ''
  const dateFrom = authStore.payrollInit?.pay_fr ?? ''
  const dateTo = authStore.payrollInit?.pay_to ?? ''

  // 1. Convert to Date objects and strip the time for an accurate day-to-day comparison
  const inputDate = new Date(formData.value.date_dt).setHours(0, 0, 0, 0)
  const minDate = new Date(dateFrom).setHours(0, 0, 0, 0)
  const maxDate = new Date(dateTo).setHours(0, 0, 0, 0)

  // 2. Compare the numeric timestamps
  if (inputDate < minDate || inputDate > maxDate) {
    errorMessage.value = `Validation Failed: Attendance date must be between ${formatDateDisplay(dateFrom)} and ${formatDateDisplay(dateTo)}.`
    return
  }

  const isDuplicate = attendanceRecords.value.some((item: any) => {
    const existingDate = new Date(item.date_dt)
    const newDate = new Date(formData.value.date_dt)
    return (
      existingDate.getDate() === newDate.getDate() &&
      existingDate.getMonth() === newDate.getMonth() &&
      existingDate.getFullYear() === newDate.getFullYear()
    )
  })

  if (isDuplicate) {
    errorMessage.value = 'Attendace already exists for this date.'
    return
  }

  try {
    const res = await Api.AttendanceRequest(authStore.accessToken, formData.value)
    console.log(res.data)
    if (!res.data.success) {
      alert(res.data.message)
      return
    }
    alert(res.data.message)
    fetchAttendance()
    closeDialog()
  } catch (error) {
    console.log(error)
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'orange-darken-2'
    case 'Approved':
      return 'green-lighten-1'
    case 'Rejected':
      return 'red-lighten-1'
    default:
      return ''
  }
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

const setShiftCode = async (date: string) => {
  try {
    const res = await Api.EmployeeShift(authStore.accessToken, date)
    formData.value.shift_code = res.data.shiftCode.shift_code

    const shiftDetails = shifts.value.find(
      (shift) => shift.shift_code === res.data.shiftCode.shift_code,
    )
    if (shiftDetails) {
      formData.value.time_in = formatForTimeInput(shiftDetails.time_in)
      formData.value.time_out = formatForTimeInput(
        shiftDetails.time_out_2nd ?? shiftDetails.time_in,
      )
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  fetchAttendance()
  fetchShifts()
})

watch(
  () => authStore.payrollInit,
  () => fetchAttendance(),
  { immediate: true },
)

watch(
  () => formData.value.date_dt,
  (value) => {
    if (value) setShiftCode(value)
  },
  { immediate: true },
)

watch(
  () => formData.value.shift_code,
  (value) => {
    if (value) {
      const shiftDetails = shifts.value.find((shift) => shift.shift_code === value)
      if (shiftDetails) {
        formData.value.time_in = formatForTimeInput(shiftDetails.time_in)
        formData.value.time_out = formatForTimeInput(
          shiftDetails.time_out_2nd ?? shiftDetails.time_in,
        )
      }
    }
  },
  { immediate: true },
)
</script>
