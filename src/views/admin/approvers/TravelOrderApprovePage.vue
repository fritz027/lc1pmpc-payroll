<template>
  <v-container fluid class="pa-0 h-100 bg-grey-lighten-4">
    <v-card
      class="h-100 rounded-0 d-flex flex-column"
      elevation="0"
      :style="{ minHeight: mobile ? '100vh' : 'auto' }"
    >
      <v-row no-gutters class="flex-grow-1 border-top" style="min-height: 0">
        <v-col
          cols="12"
          md="3"
          class="d-flex flex-column border-e bg-white"
          :style="{ height: mobile ? '40vh' : '85vh' }"
        >
          <div class="flex-grow-1 overflow-y-auto custom-scrollbar">
            <v-data-table
              :headers="employeeHeaders"
              :items="filteredEmployees"
              :search="searchQuery"
              density="compact"
              hide-default-footer
              :items-per-page="-1"
              hover
              class="dense-table"
              :loading="isLoading"
            >
              <template v-slot:item="{ item, index }">
                <tr
                  @click="selectEmployee(item)"
                  :class="{
                    'selected-row': selectedEmployee?.emp_no === item.emp_no,
                    'alt-row': index % 2 !== 0 && selectedEmployee?.emp_no !== item.emp_no,
                  }"
                  class="cursor-pointer text-caption"
                >
                  <td class="px-2 py-1 border-e">{{ item.emp_no }}</td>
                  <td class="px-2 py-1">{{ item.fullName }}</td>
                </tr>
              </template>
            </v-data-table>
          </div>

          <div class="pa-2 border-t bg-grey-lighten-3 d-flex align-center">
            <span class="mr-2 text-caption font-weight-bold">Search:</span>
            <v-text-field
              v-model="searchQuery"
              variant="solo"
              density="compact"
              hide-details
              class="bg-white rounded-0 search-input"
              flat
              style="max-height: 30px"
            ></v-text-field>
          </div>
        </v-col>

        <v-col
          id="mobile-details-pane"
          cols="12"
          md="9"
          class="d-flex flex-column bg-grey-lighten-4"
          :style="{ height: mobile ? '60vh' : '85vh' }"
        >
          <div v-if="selectedEmployee" class="pa-3 bg-white border-b d-flex align-center">
            <div>
              <div class="text-caption text-grey">Employee Travel Order Applications</div>
              <div class="text-subtitle-1 font-weight-bold">{{ selectedEmployee.fullName }}</div>
            </div>

            <v-spacer></v-spacer>

            <v-fade-transition>
              <v-btn
                v-if="selectedto.length > 0"
                color="success"
                prepend-icon="mdi-check-all"
                elevation="1"
                rounded="pill"
                @click="approveBulkTravelOrder"
              >
                Approve Selected ({{ selectedto.length }})
              </v-btn>
            </v-fade-transition>
          </div>

          <div class="flex-grow-1 overflow-auto custom-scrollbar pa-2">
            <v-data-table
              :headers="toHeaders"
              :items="toData"
              density="compact"
              hide-default-footer
              class="dense-table text-no-wrap border rounded-0"
              hover
            >
              <template v-slot:no-data>
                <div class="pa-4 text-grey text-caption text-center">
                  {{
                    selectedEmployee
                      ? 'No records found for this period.'
                      : 'Select an employee from the left panel to view details.'
                  }}
                </div>
              </template>

              <template v-slot:[`item.travelDate`]="{ item }">
                <span class="font-weight-medium">{{ formatDate(item.travel_dt_out) }}</span>
              </template>
              <template v-slot:[`item.travel_dt_out`]="{ item }">
                <span class="font-weight-medium">{{ formatTime(item.travel_dt_out) }}</span>
              </template>
              <template v-slot:[`item.travel_dt_in`]="{ item }">
                <span class="font-weight-medium">{{ formatTime(item.travel_dt_in) }}</span>
              </template>
              <template v-slot:[`item.approved`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.approved)"
                  size="x-small"
                  label
                  class="font-weight-bold"
                >
                  {{
                    item.approved === '1' || item.approved === 'Y' || item.approved === 1
                      ? 'Approved'
                      : 'Pending'
                  }}
                </v-chip>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex justify-center align-center w-100">
                  <v-tooltip
                    :text="isApproved(item.approved) ? 'Already Approved' : 'Select for Approval'"
                    location="top"
                  >
                    <template v-slot:activator="{ props }">
                      <div
                        v-if="!item.approved || item.approved === '0' || item.approved === 0"
                        v-bind="props"
                        class="action-checkbox-wrapper"
                      >
                        <v-checkbox-btn
                          :model-value="isApproved(item.approved) || isSelected(item)"
                          :readonly="isApproved(item.approved)"
                          :color="isApproved(item.approved) ? 'success' : 'primary'"
                          :icon="isApproved(item.approved) ? 'mdi-check-circle' : undefined"
                          density="compact"
                          class="centered-checkbox"
                          @change="toggleSelection(item)"
                        ></v-checkbox-btn>
                      </div>
                    </template>
                  </v-tooltip>
                </div>
              </template>
            </v-data-table>
          </div>
        </v-col>
      </v-row>
    </v-card>
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      elevation="24"
      rounded="lg"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3">
          {{ snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span class="text-subtitle-2">{{ snackbarMessage }}</span>
      </div>

      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar = false"></v-btn>
      </template>
    </v-snackbar>
    <v-overlay
      v-model="isProcessing"
      class="align-center justify-center"
      persistent
      scrim="white"
      :opacity="0.7"
    >
      <div class="text-center">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
          width="6"
          class="mb-2"
        ></v-progress-circular>

        <div class="text-h6 font-weight-medium text-primary">Processing Leave...</div>
        <div class="text-caption text-grey-darken-1">Please wait a moment.</div>
      </div>
    </v-overlay>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { usePendingCountStore } from '@/stores/pendingCounts'
import Api from '@/Api/Admin'

// Initialize display helpers for mobile responsiveness
const { mobile } = useDisplay()
const pendingCountStore = usePendingCountStore()

// --- Interfaces ---
interface Employee {
  emp_no: string
  fullName: string
}

interface TravelOrderApplication {
  emp_no: string
  travel_passno: string
  travel_dt_out: string
  travel_dt_in: string
  destination: string
  reason: string
  remarks: string
  approved: number
}

// --- State ---
const authStore = useAuthStore()
const searchQuery = ref('')
const selectedEmployee = ref<Employee | null>(null)
const toData = ref<TravelOrderApplication[]>([])
const employees = ref<Employee[]>([])
const selectedto = ref<TravelOrderApplication[]>([])
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const isProcessing = ref(false)
const isLoading = ref(false)

// --- Headers ---
const employeeHeaders = [
  { title: 'Emp. No.', key: 'emp_no', align: 'start', sortable: true, width: '30%' },
  { title: 'Employee Name', key: 'fullName', align: 'start', sortable: true, width: '70%' },
]

const toHeaders = [
  { title: 'Travel Pass No.', key: 'travel_passno', align: 'start' },
  { title: 'Travel Order Date', key: 'travelDate', align: 'start' },
  { title: 'Travel Time Out', key: 'travel_dt_out' },
  { title: 'Travel Time In', key: 'travel_dt_in' },
  { title: 'Destination', key: 'destination' },
  { title: 'Reason', key: 'reason' },
  { title: 'Remarks', key: 'remarks' },
  { title: 'Status', key: 'approved', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

// --- Computed & Methods ---
const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value
  const query = searchQuery.value.toLowerCase()
  return employees.value.filter(
    (e) => e.emp_no.toLowerCase().includes(query) || e.fullName.toLowerCase().includes(query),
  )
})

const isApproved = (approve: string | null | number) => {
  return approve === 1 || approve === '1'
}

const getStatusColor = (approve: string | null | number) => {
  return approve === 1 || approve === '1' ? 'success' : 'warning'
}

// const doneApproved = (approve: string) => {
//   if (approve === '1' || approve === 'Y') return 'success'
//   return 'warning'
// }

const selectEmployee = async (employee: Employee) => {
  try {
    isLoading.value = true
    if (!employee) return

    // Immediately set selected employee and wipe old data to prevent ghosts
    selectedEmployee.value = employee
    toData.value = []

    const dFrom = formatDateOnly(authStore.payrollInit?.pay_fr ?? '')
    const dto = formatDateOnly(authStore.payrollInit?.pay_to ?? '')

    const res = await Api.EmployeeTravelOrderRequest(
      employee.emp_no,
      dFrom,
      dto,
      authStore.accessToken,
    )

    console.log(res.data)
    const data = res.data.travelOrder

    if (data && data.length > 0) {
      toData.value = data
    }

    // Auto-scroll logic for Mobile devices
    if (mobile.value) {
      nextTick(() => {
        document.getElementById('mobile-details-pane')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }
  } catch (error) {
    console.log(error)
  }finally {
    isLoading.value = false
  }
}

const loadEmployees = async () => {
  try {
    const dFrom = formatDateOnly(authStore.payrollInit?.pay_fr ?? '')
    const dto = formatDateOnly(authStore.payrollInit?.pay_to ?? '')
    const response = await Api.FetchEmployeeByApprover(authStore.accessToken, 'travel', dFrom, dto)
    employees.value = response.data.employees
  } catch (error) {
    console.log(error)
  }
}

const formatDateOnly = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}


const isSelected = (to: TravelOrderApplication) => {
  return selectedto.value.some(
    (item) => item.travel_passno === to.travel_passno && item.emp_no === to.emp_no,
  )
}

const toggleSelection = async (to: TravelOrderApplication) => {
  const index = selectedto.value.findIndex(
    (item) => item.travel_passno === to.travel_passno && item.emp_no === to.emp_no,
  )
  if (index > -1) {
    selectedto.value.splice(index, 1)
  } else {
    selectedto.value.push(to)
  }
}


const approveBulkTravelOrder = async () => {
  if (selectedto.value.length === 0) return
  isProcessing.value = true

  try {
    console.log(selectedto.value)
    const payload = selectedto.value.map((to) => ({
      emp_no: to.emp_no,
      travel_passno: to.travel_passno,
      approved: 1,
    }))

    const res = await Api.BulkApproveTravelOrder(authStore.accessToken, payload)

    if (res.data.success) {
      snackbarMessage.value = `Successfully approved ${selectedto.value.length} applications.`
      snackbarColor.value = 'success'
      snackbar.value = true

      // Refresh the list for the current employee
      if (selectedEmployee.value) {
        await selectEmployee(selectedEmployee.value)
      }

      await pendingCountStore.fetchPendingCounts(
        authStore.payrollInit?.pay_fr ?? '',
        authStore.payrollInit?.pay_to ?? '',
        authStore.accessToken,
      )

      // Clear selection
      selectedto.value = []
    }
  } catch (error) {
    console.error('Bulk Approval Error:', error)
    snackbarMessage.value = 'Failed to approve selected leaves.'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    isProcessing.value = false
  }
}

const formatTime = (timeString: string | null) => {
  if (!timeString) return '-'
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Changes output to 24-hour format (e.g., "17:45")
  })
}

onMounted(async () => {
  try {
    loadEmployees()
  } catch (error) {
    console.log(error)
  }
})

watch(
  () => authStore.payrollInit,
  (newVal) => {
    // Only trigger if we actually have a selected employee and valid payroll dates
    if (selectedEmployee.value && newVal) {
      selectEmployee(selectedEmployee.value)
    } else {
      loadEmployees() // Refresh employee list if payrollInit changes but no employee is selected
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* Force compact desktop-app feel */
.dense-table :deep(th) {
  padding: 4px 8px !important;
  font-size: 0.75rem !important;
  font-weight: bold;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  white-space: nowrap;
}

.dense-table :deep(td) {
  padding: 2px 8px !important;
  font-size: 0.75rem !important;
  border-bottom: 1px solid #eeeeee;
}

/* Custom Row Colors based on your screenshot */
.alt-row {
  background-color: #e8f5e9; /* Light green tint */
}

.selected-row {
  background-color: #1976d2 !important; /* Vuetify Blue */
  color: white !important;
}

.selected-row td {
  border-color: #1565c0 !important;
}

/* Search input styling */
.search-input :deep(.v-field__input) {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  min-height: 24px !important;
  font-size: 0.8rem;
}

/* Scrollbar styling for a desktop look */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
/* Remove default margins and force absolute centering */
.centered-checkbox :deep(.v-selection-control) {
  justify-content: center !important;
  margin-inline-start: 0 !important;
  min-height: unset !important;
}

/* Make it more appealing with a hover effect */
.action-checkbox-wrapper {
  transition: transform 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-checkbox-wrapper:hover:not(:has(.v-selection-control--readonly)) {
  transform: scale(1.2);
}

/* Optional: subtle background for the checkbox cell on hover */
:deep(tr:hover) .action-checkbox-wrapper {
  opacity: 1;
}
</style>
