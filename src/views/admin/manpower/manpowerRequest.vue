<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4" align="center">
      <v-col>
        <h2 class="text-h5 font-weight-bold">Manpower Requests</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openNewRequest"> New Request </v-btn>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="rounded-lg" elevation="2">
      <v-data-table
        :headers="headers"
        :items="requests"
        class="elevation-0 striped-table custom-table-border"
        density="compact"
      >
        <template v-slot:[`item.status`]="{ value }">
          <v-chip :color="getStatusColor(value)" size="small" label>
            {{ getStatusText(value) }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon="mdi-eye" variant="text" size="small" @click="viewRequest(item)"></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>Manpower Request Form</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Request Number"
                  v-model="formData.reqNo"
                  density="compact"
                  variant="outlined"
                  readonly
                  bg-color="grey-lighten-4"
                ></v-text-field>
                <v-autocomplete
                  v-if="!isEditing"
                  v-model="formData.emp_no"
                  :items="allEmployees"
                  item-title="fullName"
                  item-value="emp_no"
                  label="Requestor Name"
                  density="compact"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-search"
                  :rules="[formRules.required]"
                />
                <!-- division selections -->
                <v-autocomplete
                  v-model="formData.div_code"
                  :items="allDivisions"
                  item-title="description"
                  item-value="div_code"
                  label="Division"
                  density="compact"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-group"
                  :rules="[formRules.required]"
                />
                <v-autocomplete
                  v-model="formData.position_code"
                  :items="allPositions"
                  item-title="description"
                  item-value="position_code"
                  label="Position"
                  density="compact"
                  variant="outlined"
                  prepend-inner-icon="mdi-card-account-phone"
                  :rules="[formRules.required]"
                />
                <v-select
                  label="Sex"
                  :items="['Male', 'Female', 'Any']"
                  v-model="formData.sex"
                  density="compact"
                  variant="outlined"
                  :rules="[formRules.required]"
                ></v-select>
                <v-select
                  label="Civil Status"
                  :items="['Single', 'Married', 'Widowed']"
                  v-model="formData.civilStatus"
                  density="compact"
                  variant="outlined"
                  :rules="[formRules.required]"
                ></v-select>
                <v-select
                  label="Employment Status"
                  :items="[
                    { text: 'Regular', value: 'R' },
                    { text: 'Probationary', value: 'P' },
                    { text: 'Contractual', value: 'C' },
                  ]"
                  v-model="formData.empStatus"
                  item-title="text"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                  :rules="[formRules.required]"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  label="Age Range"
                  placeholder="e.g. 21 - 35"
                  v-model="formData.age"
                  density="compact"
                  variant="outlined"
                  :rules="[formRules.required]"
                ></v-text-field>
                <v-text-field
                  label="No. of Heads"
                  type="number"
                  v-model="formData.heads"
                  density="compact"
                  variant="outlined"
                  :rules="[formRules.required]"
                ></v-text-field>
                <v-text-field
                  label="Date Needed"
                  type="date"
                  v-model="formData.dateNeeded"
                  density="compact"
                  variant="outlined"
                  :rules="[formRules.required]"
                ></v-text-field>
                <v-textarea
                  label="Educational Attainment"
                  v-model="formData.education"
                  density="compact"
                  variant="outlined"
                  rows="2"
                  :rules="[formRules.required]"
                ></v-textarea>
                <v-select
                  label="Status"
                  :items="AllStatuses"
                  item-title="text"
                  item-value="value"
                  v-model="formData.status"
                  density="compact"
                  variant="outlined"
                  :rules="[formRules.required]"
                  :readonly="!isEditing"
                ></v-select>
                <v-textarea
                  label="Remarks"
                  v-model="formData.remarks"
                  density="compact"
                  variant="outlined"
                  rows="4"
                  :rules="[formRules.required]"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveRequest" width="120"
            >Save Request</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Api from '@/Api/Admin'
import { VForm } from 'vuetify/components'

const authStore = useAuthStore()
const dialog = ref(false)
const form = ref<InstanceType<typeof VForm> | null>(null) // Added missing ref for the <v-form>

interface ManpowerRequest {
  request_number: string
  requestor: string
  div_code: string
  position_code: string
  sex: string
  civil_status: string
  educ_attainment: string
  emp_status: string
  no_of_heads: number
  no_of_heads_served: number
  date_needed: Date | string
  status: 'P' | 'A' | 'R' | 'C' | 'O' | string
  age: number
  remarks: string
  fullname: string
  department: string
  position: string
}

// Table Headers
const headers = [
  { title: 'Request No.', key: 'request_number', align: 'start' },
  { title: 'Requestor', key: 'fullname' },
  { title: 'Department', key: 'department' },
  { title: 'Position', key: 'position' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const allEmployees = ref<{ emp_no: string; fullName: string }[]>([])
const allDivisions = ref<{ div_code: string; description: string }[]>([])
const allPositions = ref<{ position_code: string; description: string }[]>([])
const AllStatuses = ref([
  { text: 'Open', value: 'O' },
  { text: 'Pending', value: 'P' },
  { text: 'Approved', value: 'A' },
  { text: 'Rejected', value: 'R' },
])

const formRules = {
  required: (v: string | number | null) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  role: (v: string | null) => !!v || 'Please select a user role',
}

// State
const requests = ref<ManpowerRequest[]>([])
const isEditing = ref(false)

// Initial Form State
const defaultForm = {
  reqNo: 'MRF-AUTO',
  emp_no: '',
  div_code: '',
  position_code: '',
  sex: '',
  civilStatus: '',
  empStatus: '',
  age: '',
  heads: 0 as number | string, // Allows empty string clearing
  dateNeeded: '',
  education: '',
  status: 'Open',
  remarks: '',
}

const formData = ref({ ...defaultForm })

// --- Helper Functions ---

// Required for <input type="date"> which strictly needs YYYY-MM-DD
const formatDateForInput = (dateString: string | Date) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
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

const getStatusColor = (status: string) => {
  if (status === 'O') return 'success'
  if (status === 'P') return 'warning'
  if (status === 'A') return 'info'
  if (status === 'R') return 'error'
  return 'grey'
}

const getStatusText = (status: string) => {
  if (status === 'O') return 'Open'
  if (status === 'P') return 'Pending'
  if (status === 'A') return 'Approved'
  if (status === 'R') return 'Rejected'
  return status
}

// --- Action Functions ---

const openNewRequest = () => {
  isEditing.value = false // Set edit state to false
  formData.value = { ...defaultForm } // Reset form to default
  if (form.value) form.value.resetValidation() // Clear any old errors
  dialog.value = true
}

const viewRequest = (item: ManpowerRequest) => {
  isEditing.value = true // Set edit state to true

  formData.value = {
    reqNo: item.request_number,
    emp_no: item.requestor,
    div_code: item.div_code,
    position_code: item.position_code,
    sex: item.sex,
    civilStatus: item.civil_status,
    empStatus: item.emp_status,
    age: String(item.age || ''),
    heads: item.no_of_heads,
    dateNeeded: formatDateForInput(item.date_needed), // Fixed Date Mapping
    education: item.educ_attainment,
    status: getStatusText(item.status),
    remarks: item.remarks,
  }
  dialog.value = true
}

const saveRequest = async () => {
  if (form.value) {
    const { valid } = await form.value.validate()
    if (!valid) return // Stop if validation fails
  }

  const payload = {
    requestor: formData.value.emp_no,
    div_code: formData.value.div_code,
    position_code: formData.value.position_code,
    sex: formData.value.sex,
    civil_status: formData.value.civilStatus,
    emp_status: formData.value.empStatus,
    age: formData.value.age,
    no_of_heads: Number(formData.value.heads || 0),
    date_needed: formatDateOnly(formData.value.dateNeeded),
    educ_attainment: formData.value.education,
    status: formData.value.status[0], // Get the value (e.g. 'O' from 'Open')
    remarks: formData.value.remarks,
  }

  try {
    const res = await Api.CreateManPowerRequest(authStore.accessToken, payload)
    if (!res.data.success) {
      console.error('Failed to save request:', res.data.message)
      return
    }
    // Refresh the list after saving
  } catch (error) {
    console.log(error)
  } finally {
    await loadManpowerRequests()
    dialog.value = false
  }
}

// --- API Calls ---

const loadManpowerRequests = async () => {
  try {
    // Fixed: properly await the promise so the catch block actually catches errors
    const res = await Api.ManPowerRequestList(authStore.accessToken)
    requests.value = res.data.manPowerRequest
  } catch (error) {
    console.error('Failed to load requests:', error)
  }
}

const loadEmployees = async () => {
  try {
    const res = await Api.FetchAvailableEmployees(authStore.accessToken)
    allEmployees.value = res.data.employees
  } catch (error) {
    console.error('Failed to load employees:', error)
  }
}

const loadInitData = async () => {
  try {
    const [divRes, posRes] = await Promise.all([
      Api.AllDivision(authStore.accessToken),
      Api.AllPosition(authStore.accessToken),
    ])
    allDivisions.value = divRes.data.divisions
    allPositions.value = posRes.data.positions
  } catch (error) {
    console.error('Failed to load init data:', error)
  }
}

onMounted(async () => {
  await Promise.all([loadManpowerRequests(), loadEmployees(), loadInitData()])
})
</script>

<style scoped>
/* Optional: Makes the table look more like the screenshot's compact style */
:deep(.v-data-table-header__content) {
  font-weight: bold !important;
  color: #555;
}
</style>
