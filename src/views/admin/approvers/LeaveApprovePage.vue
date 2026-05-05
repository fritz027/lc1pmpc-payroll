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
              <div class="text-caption text-grey">Employee Leave Applications</div>
              <div class="text-subtitle-1 font-weight-bold">{{ selectedEmployee.fullName }}</div>
            </div>

            <v-spacer></v-spacer>

            <v-fade-transition>
              <v-btn
                v-if="selectedLeaves.length > 0"
                color="success"
                prepend-icon="mdi-check-all"
                elevation="1"
                rounded="pill"
                @click="approveBulkLeaves"
              >
                Approve Selected ({{ selectedLeaves.length }})
              </v-btn>
            </v-fade-transition>
          </div>

          <div class="flex-grow-1 overflow-auto custom-scrollbar pa-2">
            <v-data-table
              :headers="leaveHeaders"
              :items="leaveData"
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

              <template v-slot:[`item.leave_dt`]="{ item }">
                <span class="font-weight-medium">{{ formatDate(item.leave_dt) }}</span>
              </template>

              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.apprvd)"
                  size="x-small"
                  label
                  class="font-weight-bold"
                >
                  {{ item.apprvd === '1' || item.apprvd === 'Y' ? 'Approved' : 'Pending' }}
                </v-chip>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <!-- Single flex container to keep icons inline and centered -->
                <div class="d-flex justify-center align-center w-100 ga-2">

                  <!-- View Certificate Action -->
                  <v-tooltip v-if="item.leave_cd === 'SIC' && item.image" text="View Certificate" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-eye"
                        color="blue-grey-darken-1"
                        size="small"
                        variant="text"
                        @click="viewCertificate(item)"
                      />
                    </template>
                  </v-tooltip>

                  <!-- Approval Action -->
                  <v-tooltip
                    v-if="item.apprvd !== '0'"
                    :text="isApproved(item.date_posted) ? 'Already Approved' : 'Select for Approval'"
                    location="top"
                  >
                    <template v-slot:activator="{ props }">
                      <div v-bind="props" class="action-checkbox-wrapper">
                        <v-checkbox-btn
                          :model-value="isApproved(item.date_posted) || isSelected(item)"
                          :readonly="isApproved(item.date_posted)"
                          :color="isApproved(item.date_posted) ? 'success' : 'primary'"
                          :icon="isApproved(item.date_posted) ? 'mdi-check-circle' : undefined"
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

  <v-dialog
    v-model="isPreviewOpen"
    fullscreen
    transition="dialog-bottom-transition"
    scrim="black"
  >
  <v-card class="d-flex flex-column bg-grey-darken-4">
    <!-- Toolbar -->
    <v-toolbar color="surface" density="comfortable" elevation="2">
      <v-btn icon @click="isPreviewOpen = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title class="text-subtitle-1 font-weight-bold">
        Document Preview
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- Action buttons for the preview -->
      <v-btn
        v-if="selectedLeave?.image"
        icon="mdi-download"
        variant="text"
        @click="downloadFile"
      ></v-btn>
    </v-toolbar>

    <!-- Content Area -->
    <v-card-text class="pa-0 flex-grow-1 d-flex flex-column overflow-hidden">
      <div class="preview-scroll-container">
        <!-- PDF Rendering -->
        <template v-if="isPDF(selectedLeave?.image ?? '')">
          <div class="d-flex justify-center py-4">
            <vue-pdf-embed
              :source="selectedLeave?.image ?? ''"
              :width="fullScreenWidth"
              class="elevation-10"
            />
          </div>
        </template>

        <!-- Image Rendering -->
        <template v-else>
          <div class="d-flex align-center justify-center fill-height pa-4">
            <v-img
              :src="selectedLeave?.image ?? ''"
              class="rounded-lg elevation-10"
              max-width="100%"
              contain
            ></v-img>
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import VuePdfEmbed from 'vue-pdf-embed'
import Api from '@/Api/Admin'

// Initialize display helpers for mobile responsiveness
const { mobile } = useDisplay()

// --- Interfaces ---
interface Employee {
  emp_no: string
  fullName: string
}

interface LeaveApplication {
  apply_on: string
  as_fullname: string
  comp_apply_on: string
  confidential: string
  date_posted: string | null
  emp_no: string
  apprvd: string
  for_year: number
  init_cd: string | null
  leave_cd: string
  leave_dt: string
  no_hrs: number
  phalf: string | null
  with_pay: string
  reason: string
  image: string | null
}

// --- State ---
const authStore = useAuthStore()
const searchQuery = ref('')
const selectedEmployee = ref<Employee | null>(null)
const leaveData = ref<LeaveApplication[]>([])
const employees = ref<Employee[]>([])
const selectedLeaves = ref<LeaveApplication[]>([])
const selectedLeave = ref<LeaveApplication | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const isProcessing = ref(false)
const isLoading = ref(false)
const isPreviewOpen = ref(false)

// --- Headers ---
const employeeHeaders = [
  { title: 'Emp. No.', key: 'emp_no', align: 'start', sortable: true, width: '30%' },
  { title: 'Employee Name', key: 'fullName', align: 'start', sortable: true, width: '70%' },
]

const leaveHeaders = [
  { title: 'Leave Type', key: 'leave_cd' },
  { title: 'Leave Date', key: 'leave_dt' },
  { title: 'Hours', key: 'no_hrs' },
  { title: 'With Pay', key: 'with_pay', align: 'center' },
  { title: 'Reason', key: 'reason' },
  { title: 'Status', key: 'status', align: 'center' },
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

const isApproved = (datePosted: string | null) => {
  return datePosted !== null && datePosted !== '00/00/0000'
}

const getStatusColor = (datePosted: string | null) => {
  return isApproved(datePosted) ? 'success' : 'warning'
}

const { width, name} = useDisplay()
// const isFullscreen = ref(false)

const isMobile = computed(() => ['xs', 'sm'].includes(name.value))

// const pdfWidth = computed(() => {
//   if (isMobile.value) {
//     // Take the screen width and subtract the card/dialog margins (usually ~32px)
//     // plus the internal padding we added (~32px).
//     // Total 64px-80px is a safe buffer.
//     return width.value - 80;
//   }
//   return 450;
// })


const downloadFile = () => {
  if (!selectedLeave.value?.image) return
  const link = document.createElement('a')
  link.href = selectedLeave.value.image
  link.download = `leave-attachment-${selectedLeave.value.emp_no}`
  link.click()
}

const isPDF = (url: string) => {
  return url.toLowerCase().endsWith('.pdf');
};

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
    leaveData.value = []

    const dFrom = formatDateOnly(authStore.payrollInit?.pay_fr ?? '')
    const dto = formatDateOnly(authStore.payrollInit?.pay_to ?? '')

    const res = await Api.FetchEmployeeLeaveByApprover(
      employee.emp_no,
      dFrom,
      dto,
      authStore.accessToken,
    )

    const data = res.data.leave

    if (data && data.length > 0) {
      leaveData.value = data
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


const viewCertificate = (item: LeaveApplication) => {
  selectedLeave.value = item;
  isPreviewOpen.value = true;
}

const fullScreenWidth = computed(() => {
  // Subtract padding for the PDF inside the fullscreen view
  const margin = isMobile.value ? 20 : 100
  return width.value - margin
})

const loadEmployees = async () => {
  try {
    const dFrom = formatDateOnly(authStore.payrollInit?.pay_fr ?? '')
    const dto = formatDateOnly(authStore.payrollInit?.pay_to ?? '')
    const response = await Api.FetchEmployeeByApprover(authStore.accessToken, 'leave', dFrom, dto)
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

// const checkWithPay = (val: string | null | undefined): boolean => {
//   if (!val) return false
//   const normalized = val.toString().trim().toUpperCase()
//   return normalized === 'Y' || normalized === '1' || normalized === 'TRUE'
// }

const isSelected = (leave: LeaveApplication) => {
  return selectedLeaves.value.some(
    (item) => item.leave_dt === leave.leave_dt && item.emp_no === leave.emp_no,
  )
}

const toggleSelection = async (leave: LeaveApplication) => {
  const index = selectedLeaves.value.findIndex(
    (item) => item.leave_dt === leave.leave_dt && item.emp_no === leave.emp_no,
  )
  if (index > -1) {
    selectedLeaves.value.splice(index, 1)
  } else {
    selectedLeaves.value.push(leave)
  }
}

// const rejectLeave = async (leave: LeaveApplication) => {
//   try {
//     console.log('Reject clicked for:', leave)
//     // Add your reject logic/API call here
//   } catch (error) {
//     console.log(error)
//   }
// }

const approveBulkLeaves = async () => {
  if (selectedLeaves.value.length === 0) return
  isProcessing.value = true

  try {
    const payload = selectedLeaves.value.map((leave) => ({
      emp_no: leave.emp_no,
      leave_dt: leave.leave_dt,
      for_year: leave.for_year,
      leave_cd: leave.leave_cd,
    }))

    const res = await Api.BulkApproveLeave(authStore.accessToken, payload)

    if (res.data.success) {
      snackbarMessage.value = `Successfully approved ${selectedLeaves.value.length} applications.`
      snackbarColor.value = 'success'
      snackbar.value = true

      // Refresh the list for the current employee
      if (selectedEmployee.value) {
        await selectEmployee(selectedEmployee.value)
      }

      // Clear selection
      selectedLeaves.value = []
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
      loadEmployees() // Refresh employee list if payrollInit changes and no employee is selected
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
.preview-scroll-container {
  height: calc(100vh - 64px); /* Subtract toolbar height */
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #2c2c2c;
}

.attachment-preview-container {
  position: relative;
  cursor: pointer;
  background: #f5f5f5;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.attachment-preview-container:hover .preview-overlay {
  opacity: 1;
}

.pdf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Ensure PDF fits width on mobile */
:deep(.vue-pdf-embed > div) {
  margin-bottom: 8px !important;
}
</style>
