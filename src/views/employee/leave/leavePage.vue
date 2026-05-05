<template>
  <v-container>
    <v-card elevation="2" class="mb-6 rounded-lg border">
      <v-card-item class="bg-grey-lighten-4 py-2 border-b">
        <template v-slot:title>
          <div class="text-subtitle-1 font-weight-bold">Leave Balances</div>
        </template>
        <template v-slot:append>
          <div style="width: 130px">
            <v-select
              v-model="selectedYear"
              :items="availableYears"
              variant="outlined"
              density="compact"
              hide-details
              bg-color="white"
              prepend-inner-icon="mdi-calendar"
            ></v-select>
          </div>
        </template>
      </v-card-item>

      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" sm="6">
            <v-card variant="tonal" color="info" class="rounded-lg h-100">
              <v-card-text>
                <div class="text-overline mb-2 text-info">Sick Leave (SIC)</div>
                <v-row no-gutters class="align-center">
                  <v-col cols="4" class="text-left">
                    <div class="text-caption text-medium-emphasis">Credits</div>
                    <div class="text-subtitle-1 text-success font-weight-bold">
                      {{ employeeLeaveBalances?.sic_crdts || 0 }}
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-center border-e border-s px-2">
                    <div class="text-caption text-medium-emphasis">Used</div>
                    <div class="text-subtitle-1 text-error font-weight-bold">
                      {{ employeeLeaveBalances?.sic_used || 0 }}
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <div class="text-caption text-primary font-weight-bold">Remaining</div>
                    <div class="text-h6 text-primary font-weight-black">
                      {{
                        (employeeLeaveBalances?.sic_crdts ?? 0) -
                        (employeeLeaveBalances?.sic_used ?? 0)
                      }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6">
            <v-card variant="tonal" color="warning" class="rounded-lg h-100">
              <v-card-text>
                <div class="text-overline mb-2 text-warning">Vacation Leave (VAC)</div>
                <v-row no-gutters class="align-center">
                  <v-col cols="4" class="text-left">
                    <div class="text-caption text-medium-emphasis">Credits</div>
                    <div class="text-subtitle-1 text-success font-weight-bold">
                      {{ employeeLeaveBalances?.vac_crdts || 0 }}
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-center border-e border-s px-2">
                    <div class="text-caption text-medium-emphasis">Used</div>
                    <div class="text-subtitle-1 text-error font-weight-bold">
                      {{ employeeLeaveBalances?.vac_used || 0 }}
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <div class="text-caption text-primary font-weight-bold">Remaining</div>
                    <div class="text-h6 text-primary font-weight-black">
                      {{
                        (employeeLeaveBalances?.vac_crdts ?? 0) -
                        (employeeLeaveBalances?.vac_used ?? 0)
                      }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row class="mb-4 mt-2" align="center">
      <v-col cols="12" sm="auto">
        <h2 class="text-h5 text-sm-h4 font-weight-bold text-blue-grey-darken-3">Employee Leave</h2>
      </v-col>

      <v-spacer class="d-none d-sm-block"></v-spacer>

      <v-col cols="12" sm="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          elevation="2"
          rounded="lg"
          class="text-none px-6"
          block
        >
          File New Leave
        </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2" class="rounded-lg border">
      <v-data-table
        :headers="headers"
        :items="leaveRecords"
        class="elevation-0 striped-table custom-table-border"
        hover
      >
        <template v-slot:[`item.leave_dt`]="{ item }">
          <span class="font-weight-medium">{{ formatDate(item.leave_dt) }}</span>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.apprvd)"
            :variant="isApproved(item.apprvd) ? 'flat' : 'tonal'"
            size="small"
            class="font-weight-bold text-uppercase"
          >
            {{ isApproved(item.apprvd) ? 'Approved' : 'Pending' }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex gap-1 align-center">
          <!-- View (Always visible) -->
          <v-btn icon="mdi-eye" color="blue-grey-darken-1" size="small" variant="text" @click="viewLeave(item)" />

          <!-- Upload (SIC only, Pending only) -->
          <!-- <v-btn
            v-if="item.leave_cd === 'SIC' && !isApproved(item.apprvd)"
            icon="mdi-file-upload"
            color="success"
            size="small"
            variant="text"
            @click="openModal(item)"
          /> -->

          <!-- Delete (Pending only) -->
          <v-btn
            v-if="!isApproved(item.apprvd)"
            icon="mdi-delete"
            color="error"
            size="small"
            variant="text"
            @click="deleteLeave(item)"
          />
        </div>
      </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="850px" class="pb-10">
      <NewLeave
        :for-year="selectedYear"
        :edit-data="selectedItem"
        :is-view="isView"
        @close="onClose"
        @saved="onLeaveSaved"
      />
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import leaveApi from '@/Api/Leave'
import NewLeave from './newLeave.vue'

interface EmployeeLeaveBalance {
  date_hired: string
  emp_no: string
  for_year: number
  fullname: string
  sic_actual: number
  sic_crdts: number
  sic_used: number
  vac_actual: number
  vac_crdts: number
  vac_used: number
}

interface LeaveApplication {
  apply_on: string
  as_fullname: string
  comp_apply_on: string
  confidential: string
  date_posted: string | null
  emp_no: string
  for_year: number
  init_cd: string | null
  leave_cd: string
  leave_dt: string
  no_hrs: number
  phalf: string | null
  with_pay: string
  reason: string
  apprvd: string
  image: string | null
}


const currentYear = new Date().getFullYear().toString()
const authStore = useAuthStore()
const errorSnack = ref(false)
const errorMessage = ref('')
const isView = ref(false)

const selectedYear = ref(currentYear)
const employeeLeaveBalances = ref<EmployeeLeaveBalance | null>(null)
const leaveRecords = ref<LeaveApplication[]>([])


// const uploadDialog = ref(false)
// const isUploading = ref(false)
// const fileType = ref('jpg')
// const selectedFile = ref<LeaveApplication | null>(null)
// const currentExtension = ref('jpg')
// const newFile = ref<File | null>(null);




// const openModal = (item: LeaveApplication | null) => {
//   selectedFile.value = item
//   currentExtension.value = 'jpg'
//   newFile.value = null
//   uploadDialog.value = true
// }


// const handleUpload = async () => {
//   if (!newFile.value) return;

//   const fileName = newFile.value.name || '';
//   const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
//   currentExtension.value = ext;

//   const formData = new FormData();

//   const date = formatDateMMDDYYYY(selectedFile.value?.leave_dt ?? '');

//   formData.append('file', newFile.value);
//   formData.append('date', date)

//   try {
//     isUploading.value = true;

//     const response = await leaveApi.UploadLeave(authStore.accessToken, formData)

//     if (!response.data.success) {
//       errorMessage.value = response.data.message
//     }

//     // getUrl()

//     alert("Upload Successfully!");

//   } catch (error) {
//    console.error('Upload failed', error);
//     alert('Failed to upload file.');
//   } finally {
//     isUploading.value = false;
//   }

// }


// const formatDateMMDDYYYY = (dateStr: string) => {
//   if (!dateStr) return '';
//   const [year, month, day] = dateStr.split('-');
//   return `${month}${day}${year}`;
// }

const availableYears = computed(() => {
  const years = []
  const startYear = parseInt(currentYear)

  for (let i = 0; i < 5; i++) {
    years.push((startYear - i).toString())
  }
  return years
})

const loadEmployeeCredits = async (year: string) => {
  try {
    const result = await leaveApi.getEmployeeLeaveCredits(authStore.accessToken, Number(year))
    employeeLeaveBalances.value = result.data.data
  } catch (error) {
    console.error('Failed to load leave credits:', error)
  }
}

const loadEmployeeLeaveList = async (year: string) => {
  try {
    const result = await leaveApi.getEmployeeLeaveList(authStore.accessToken, Number(year))
    leaveRecords.value = result.data.data
  } catch (error) {
    console.error('Failed to load leave list:', error)
  }
}

onMounted(async () => {
  await loadEmployeeCredits(selectedYear.value)
  await loadEmployeeLeaveList(selectedYear.value)
})

watch(selectedYear, async (newYear) => {
  await loadEmployeeCredits(newYear)
  await loadEmployeeLeaveList(newYear)
})

// Updated headers to match the new LeaveApplication interface
const headers = [
  { title: 'Leave Type', key: 'leave_cd' }, // Displays VAC, SIC, etc.
  { title: 'Leave Date', key: 'leave_dt' },
  { title: 'Hours', key: 'no_hrs' },
  { title: 'Status', key: 'status' }, // Custom slot
  { title: 'Actions', key: 'actions', sortable: false }, // Custom slot
]

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

const onLeaveSaved = async (newLeaveData: FormData) => {
  // 1. Prepare Key Identifiers for Comparison
  // We use strings for consistency since database values often return as strings
  const newDate = newLeaveData.get('leaveDate') // Format: 'YYYY-MM-DD'

  // 2. Duplicate Check Logic
  // Only run this if we are creating a NEW record (not editing an existing one)
  if (!selectedItem.value) {
    const isDuplicate = leaveRecords.value.some((item: LeaveApplication) => {
      // Normalize existing date: slice(0, 10) ensures 'YYYY-MM-DD' comparison
      const existingDate = item.leave_dt ? item.leave_dt.slice(0, 10) : ''

      return existingDate === newDate
    })

    if (isDuplicate) {
      errorMessage.value = 'This leave record already exists for the selected date.'
      errorSnack.value = true
      return
    }
  }


  try {
    newLeaveData.append('for_year', String(selectedYear.value))
    const response = await leaveApi.upsertLeave(authStore.accessToken, newLeaveData)
    if (response.data.success) {
      // Refresh both the list and the credits summary
      await Promise.all([
        loadEmployeeLeaveList(selectedYear.value),
        loadEmployeeCredits(selectedYear.value), // Important to refresh the balance card!
      ])

      dialog.value = false
      selectedItem.value = null // Clear edit state
    } else {
      console.error('Save failed:', response.data.message)
    }
  } catch (error) {
    console.log('Error during save:', error)
  }
}

const dialog = ref(false)
const selectedItem = ref<LeaveApplication | null>(null)

// Checks if date_posted exists (is not null)
const isApproved = (apprvd: string | null) => {
  // We check for both null and your old '00/00/0000' just in case of legacy data
  return apprvd !== null && apprvd !== '0'
}

const getStatusColor = (apprvd: string | null | number) => {

  return apprvd === '1' || apprvd === 'Y' || apprvd === 1 ? 'success' : 'warning'
}

const openDialog = (item: LeaveApplication | null = null) => {

  selectedItem.value = item
  dialog.value = true
}

// const editLeave = (item: LeaveApplication) => {
//   console.log('Editing:', item.emp_no)
//   isView.value = false
//   openDialog(item)
// }

const onClose = () => {
  isView.value = false
  selectedItem.value = null
  dialog.value = false
}

const deleteLeave = async (item: LeaveApplication) => {
  if (confirm(`Are you sure you want to delete leave for ${item.as_fullname}?`)) {
    try {
      const payload = {
        for_year: selectedYear.value,
        leave_cd: item.leave_cd,
        leave_dt: item.leave_dt,
        no_hrs: item.no_hrs,
        with_pay: item.with_pay,
        reason: item.reason,
        apply_on: item.apply_on,
      }
      const response = await leaveApi.deleteLeave(authStore.accessToken, payload)
      if (response.data.success) {

        leaveRecords.value = leaveRecords.value.filter((r) => r !== item)
      } else {
        console.error('Failed to delete leave:', response.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }
}

const viewLeave = (item: LeaveApplication | null) => {
  selectedItem.value = item
  isView.value = true
  dialog.value = true
}

const handleBackNavigation = () => {
  // Logic to handle back navigation, e.g., reset state or navigate to a specific route
  if (dialog.value) {
    dialog.value = false
    selectedItem.value = null
  }
}

// const viewUpload = (item: LeaveApplication | null) => {

// }

watch(dialog, (newVal) => {
  if (newVal) {
    window.history.pushState({ dialogOpen: true }, '')
    window.addEventListener('popstate', handleBackNavigation)
  } else {
    // Clean up when the dialog is closed via "Save" or "Cancel"
    window.removeEventListener('popstate', handleBackNavigation)

    // If the dialog closed but the history state is still there, remove it
    if (window.history.state?.dialogOpen) {
      window.history.back()
    }
  }
})

// Always remove the listener if the user leaves the page entirely
onUnmounted(() => {
  window.removeEventListener('popstate', handleBackNavigation)
})

</script>

<style scoped>
.balance-table {
  font-family: monospace;
}

.balance-table :deep(th),
.balance-table :deep(td) {
  border: 1px solid #ccc !important;
  height: 32px !important;
  padding: 0 8px !important;
}

.border-right {
  border-right: 1px solid #ccc !important;
}

.border-bottom {
  border-bottom: 1px solid #ccc !important;
}

.text-right {
  text-align: right;
}
</style>
