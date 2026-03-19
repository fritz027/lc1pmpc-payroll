<template>
  <v-card class="rounded-lg border mx-auto" max-width="850" elevation="3">
    <v-card-title class="bg-primary text-white d-flex align-center py-3 px-6">
      <v-icon icon="mdi-calendar-plus" class="mr-3"></v-icon>
      <span class="text-h6 font-weight-bold">
        {{ isView ? 'View Leave Form' : isEditMode ? 'Edit Leave Form' : 'New Leave Form' }}
      </span>
    </v-card-title>

    <v-card-text class="pa-0">
      <div class="bg-blue-grey-lighten-5 pa-6 border-b">
        <v-row align="center">
          <v-col cols="12" md="7">
            <div class="d-flex align-center">
              <v-avatar
                color="primary"
                variant="tonal"
                rounded="lg"
                size="56"
                class="mr-4 d-none d-sm-flex"
              >
                <v-icon size="32">mdi-account-tie</v-icon>
              </v-avatar>

              <div>
                <div
                  class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1"
                >
                  Filing Leave For
                </div>
                <div class="text-h6 font-weight-bold text-blue-grey-darken-3 lh-1">
                  {{ employeeContext.fullname || 'Employee Name' }}
                </div>
                <div class="text-subtitle-2 text-medium-emphasis mt-1">
                  <v-icon size="small" class="mr-1 mb-1"
                    >mdi-badge-account-horizontal-outline</v-icon
                  >
                  {{ employeeContext.empNo }}
                  <span class="mx-2">&bull;</span>
                  <v-icon size="small" class="mr-1 mb-1">mdi-calendar-check</v-icon>
                  Hired: {{ employeeContext.dateHired }}
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5">
            <v-card elevation="0" class="bg-white rounded-lg border">
              <v-card-text class="pa-3">
                <div
                  class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-2 text-center"
                >
                  Selected Leave Balance
                </div>

                <v-row no-gutters align="center" justify="space-between">
                  <v-col class="text-center">
                    <div class="text-caption text-medium-emphasis">Credits</div>
                    <div class="text-subtitle-1 text-success font-weight-bold">
                      {{ credit.credits ?? 0 }}
                    </div>
                  </v-col>

                  <v-divider vertical class="mx-2"></v-divider>

                  <v-col class="text-center">
                    <div class="text-caption text-medium-emphasis">Used</div>
                    <div class="text-subtitle-1 text-error font-weight-bold">
                      {{ credit.used ?? 0 }}
                    </div>
                  </v-col>

                  <v-divider vertical class="mx-2"></v-divider>

                  <v-col class="text-center bg-blue-lighten-5 rounded pa-1">
                    <div class="text-caption text-primary font-weight-bold">Remaining</div>
                    <div class="text-h6 text-primary font-weight-black">
                      {{ credit.remaining ?? 0 }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div class="pa-6">
        <div class="text-overline text-medium-emphasis mb-4">Leave Details</div>
        <v-form ref="leaveForm" v-model="isFormValid">
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="formData.kindOfLeave"
                :items="leaveTypes"
                label="Kind of Leave"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-list-bulleted-type"
                clearable
                :readonly="isView"
                :rules="[(v: any) => !!v || 'Leave type is required']"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.leaveDate"
                label="Leave Date"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
                :readonly="isView"
                :rules="[(v: any) => !!v || 'Leave date is required']"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.reason"
                label="Reason for Leave"
                variant="outlined"
                density="comfortable"
                rows="3"
                auto-grow
                prepend-inner-icon="mdi-text-box-edit-outline"
                :rules="[(v: any) => !!v || 'Reason is required']"
                :readonly="isView"
              ></v-textarea>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="formData.hours"
                label="Requested Hours"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-clock-outline"
                :rules="[(v: any) => v >= 0 || 'Must be greater than or equal to 0']"
                :readonly="isView"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex align-center">
              <v-switch
                v-model="formData.withPay"
                label="With Pay"
                color="primary"
                inset
                hide-details
                :readonly="isEditMode"
              ></v-switch>
            </v-col>
          </v-row>
        </v-form>
      </div>

      <!-- <div class="px-6 pb-2 d-flex flex-wrap gap-4 text-caption text-medium-emphasis">
        <div class="d-flex align-center">
          <v-icon size="small" class="mr-1">mdi-clock-edit-outline</v-icon>
          Encode Date: <strong>{{ systemInfo.encodeDate }}</strong>
        </div>
        <div class="d-flex align-center text-primary">
          <v-icon size="small" class="mr-1">mdi-calendar-alert</v-icon>
          Payroll CutOff: <strong>{{ systemInfo.payrollCutoff }}</strong>
        </div>
      </div> -->
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4 bg-grey-lighten-4">
      <v-spacer></v-spacer>
      <v-btn color="blue-grey-darken-1" variant="text" class="text-none px-4" @click="handleCancel">
        Cancel
      </v-btn>
      <v-btn
        v-if="!isView"
        color="primary"
        variant="elevated"
        rounded="pill"
        class="text-none px-6"
        :disabled="!isFormValid"
        @click="handleSave"
      >
        {{ isEditMode ? 'Update Leave' : 'Save Leave' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import leaveApi from '@/Api/Leave'
import attendanceApi from '@/Api/Attendance'

// Basic interface for the new form
interface NewLeaveForm {
  kindOfLeave: string | null
  leaveDate: string
  reason: string
  hours: number | null
  withPay: boolean
}
interface leaveType {
  value: string
  title: string
}
interface Credit {
  credits: number
  used: number
  remaining: number
}

const props = defineProps<{
  forYear: string | number
  editData: any | null
  isView: boolean | null
}>()

const isEditMode = computed(() => !!props.editData)

// Form state
const authStore = useAuthStore()

const isFormValid = ref(false)
const leaveForm = ref<any>(null) // Ref to the v-form for manual validation
const leaveTypes = ref<leaveType[]>([])
const credit = ref<Credit>({
  credits: 0,
  used: 0,
  remaining: 0,
})
const emit = defineEmits(['close', 'saved'])
const isView = ref(false)

// Reactive form data payload
const formData = reactive<NewLeaveForm>({
  kindOfLeave: '', // Default to Vacation based on image
  leaveDate: '',
  reason: '',
  hours: 0, // Sensible default for a standard day
  withPay: true,
})

// Options for the dropdown

// Mocked Employee Context (In reality, pass this via props or state store)
const employeeContext = reactive({
  empNo: '',
  fullname: '',
  dateHired: '',
  monthsEmployed: 0,
  forYear: 0,
})

onMounted(async () => {
  try {
    await loadLeaveTypes()
    await loadEmployee()
    if (props.editData) {
      formData.kindOfLeave = props.editData.leave_cd
      formData.leaveDate = formatForDatePicker(props.editData.leave_dt)
      formData.reason = props.editData.reason
      formData.hours = props.editData.no_hrs
      formData.withPay = props.editData.with_pay === '1'
      await setCredit(formData.kindOfLeave ?? '')
    }
    if (props.isView) {
      isView.value = true
    }
  } catch (error) {
    console.log(error)
  }
})

watch(
  () => formData.kindOfLeave,
  async (newValue) => {
    if (newValue) {
      await setCredit(newValue)
    } else {
      credit.value = { credits: 0, used: 0, remaining: 0 }
    }
  },
  { immediate: true }, // <--- THIS forces it to run the moment the dialog opens!
)

const setCredit = async (leaveType: string) => {
  try {
    const response = await leaveApi.getCreditByTypes(
      authStore.accessToken,
      leaveType,
      employeeContext.forYear,
    )

    const data = response.data.data

    // 1. Safety Check: If data is null, or if the array is completely empty []
    if (!data || data.length === 0) {
      credit.value = { credits: 0, used: 0, remaining: 0 }
      return
    }

    // 2. Target the exact object inside the array!
    const targetData = data[0]

    // 3. Map the properties safely
    credit.value = {
      credits: targetData.crdts ?? 0,
      used: targetData.used ?? 0,
      remaining: (targetData.crdts ?? 0) - (targetData.used ?? 0),
    }
  } catch (error) {
    console.error('Failed to fetch credits:', error)
    credit.value = { credits: 0, used: 0, remaining: 0 }
  }
}

const loadEmployee = async () => {
  try {
    employeeContext.empNo = authStore.employee?.employeeNo ?? ''
    employeeContext.fullname = `${authStore.employee?.lastName ?? ''}, 
    ${authStore.employee?.firstName ?? ''}`
    employeeContext.dateHired = formatToMMDDYYYY(authStore.employee?.dateHired ?? '')
    const monthsEmployed = calculateMonthsEmployed(employeeContext.dateHired)
    employeeContext.monthsEmployed = monthsEmployed
    employeeContext.forYear = Number(props.forYear)
  } catch (error) {
    console.log(error)
  }
}

const loadLeaveTypes = async () => {
  try {
    const response = await leaveApi.getLeaveTypes(authStore.accessToken)
    const rawData = response.data.data
    const allowedCodes = ['VAC', 'SIC']
    leaveTypes.value = rawData
      .filter((item: any) => allowedCodes.includes(item.leave_cd))
      .map((item: any) => {
        return {
          // Assuming your DB returns 'description' and 'leave_cd'
          title: `${item.pay_desc} (${item.leave_cd})`,
          value: item.leave_cd,
        }
      })
  } catch (error) {
    console.log(error)
  }
}

// System info that was awkwardly placed in the old UI
const systemInfo = reactive({
  encodeDate: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }),
  payrollCutoff: '03/10/2026', // You'd fetch this from your backend logic
})

const formatForTimeInput = (rawTime: string | null) => {
  if (!rawTime) return ''
  const timePart = rawTime.includes('T') ? rawTime.split('T')[1] : rawTime.split(' ')[1]
  return timePart ? timePart.substring(0, 5) : ''
}

const calculateMonthsEmployed = (hireDateString: string): number => {
  if (!hireDateString) return 0

  const hireDate = new Date(hireDateString)
  const today = new Date()

  let months = (today.getFullYear() - hireDate.getFullYear()) * 12
  months -= hireDate.getMonth()
  months += today.getMonth()

  if (today.getDate() < hireDate.getDate()) {
    months--
  }

  return months <= 0 ? 0 : months
}

const formatForDatePicker = (rawDate: string | null) => {
  if (!rawDate) return ''

  const d = new Date(rawDate)
  if (isNaN(d.getTime())) return '' // Failsafe for invalid dates

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatToMMDDYYYY = (dateString: string | Date | null): string => {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (isNaN(date.getTime())) return ''

  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = date.getFullYear()

  return `${mm}-${dd}-${yyyy}`
}

// Action Handlers
const handleCancel = () => {
  // Reset form or emit close event to parent dialog
  formData.leaveDate = ''
  formData.reason = ''
  emit('close')
}

const handleSave = async () => {
  const { valid } = await leaveForm.value.validate()
  if (valid) {
    emit('saved', formData)
  }
}

const calculateTotalHours = (timeIn: string, timeOut: string): number => {
  if (!timeIn || !timeOut) return 0
  const formatedTimeIn = formatForTimeInput(timeIn)
  const formatedTimeOut = formatForTimeInput(timeOut)
  if (!formatedTimeIn || !formatedTimeOut) return 0
  const [inHours, inMins] = formatedTimeIn.split(':').map(Number)
  const [outHours, outMins] = formatedTimeOut.split(':').map(Number)

  // Convert to total minutes from midnight
  const inTotalMinutes = inHours * 60 + inMins
  let outTotalMinutes = outHours * 60 + outMins

  // Handle overnight shifts (e.g., In at 22:00, Out at 06:00)
  if (outTotalMinutes < inTotalMinutes) {
    outTotalMinutes += 24 * 60 // Add 24 hours worth of minutes
  }

  // Calculate the difference and convert back to hours
  const totalHours = (outTotalMinutes - inTotalMinutes) / 60

  // Round to 2 decimal places (e.g., 8.5) to avoid floating point issues
  return Math.round(totalHours * 100) / 100
}

const getTotalHours = async (leaveDate: string) => {
  try {
    const res = await attendanceApi.EmployeeShift(authStore.accessToken, leaveDate)
    const shitf = res.data.shiftCode
    let hours = 0
    if (!shitf.time_out_2nd) {
      hours = calculateTotalHours(shitf.time_in, shitf.time_out) - 1
    } else {
      hours = calculateTotalHours(shitf.time_in, shitf.time_out_2nd) - 1
    }
    formData.hours = hours
  } catch (error) {
    console.log(error)
  }
}

watch(
  () => formData.leaveDate,
  (value) => {
    if (value) {
      getTotalHours(value)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* Minor utility gap class if you aren't using Tailwind or Vuetify's d-flex utilities extensively */
.gap-4 {
  gap: 16px;
}
</style>
