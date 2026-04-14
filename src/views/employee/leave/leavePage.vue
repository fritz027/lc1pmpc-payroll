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
        <template v-slot:item.leave_dt="{ item }">
          <span class="font-weight-medium">{{ formatDate(item.leave_dt) }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.apprvd)"
            :variant="isApproved(item.apprvd) ? 'flat' : 'tonal'"
            size="small"
            class="font-weight-bold text-uppercase"
          >
            {{ isApproved(item.apprvd) ? 'Approved' : 'Pending' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1 align-center">
            <template v-if="!isApproved(item.apprvd)">
              <v-tooltip text="View Record" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-eye"
                    variant="text"
                    color="blue-grey-darken-1"
                    size="small"
                    @click="viewLeave(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Delete Leave" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    @click="deleteLeave(item)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </template>

            <template v-else>
              <v-tooltip text="View Record" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-eye"
                    variant="text"
                    color="blue-grey-darken-1"
                    size="small"
                    @click="viewLeave(item)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </template>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="850px" persistent>
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
import { ref, computed, onMounted, watch } from 'vue'
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
}

const currentYear = new Date().getFullYear().toString()
const authStore = useAuthStore()
const errorSnack = ref(false)
const errorMessage = ref('')
const isView = ref(false)

const selectedYear = ref(currentYear)
const employeeLeaveBalances = ref<EmployeeLeaveBalance | null>(null)
const leaveRecords = ref<LeaveApplication[]>([])

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
    console.log(result.data)
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

const onLeaveSaved = async (newLeaveData: any) => {
  // 1. Prepare Key Identifiers for Comparison
  // We use strings for consistency since database values often return as strings
  const newDate = newLeaveData.leaveDate // Format: 'YYYY-MM-DD'
  const newType = newLeaveData.kindOfLeave
  const newPayStatus = newLeaveData.withPay ? '1' : '0'

  // 2. Duplicate Check Logic
  // Only run this if we are creating a NEW record (not editing an existing one)
  if (!selectedItem.value) {
    const isDuplicate = leaveRecords.value.some((item: any) => {
      // Normalize existing date: slice(0, 10) ensures 'YYYY-MM-DD' comparison
      const existingDate = item.leave_dt ? item.leave_dt.slice(0, 10) : ''
      const existingPay = String(item.with_pay)

      return existingDate === newDate
    })

    if (isDuplicate) {
      errorMessage.value = 'This leave record already exists for the selected date.'
      errorSnack.value = true
      return
    }
  }

  // 3. Proceed to Save
  const payload = {
    for_year: selectedYear.value,
    leave_cd: newLeaveData.kindOfLeave,
    leave_dt: newLeaveData.leaveDate,
    no_hrs: newLeaveData.hours,
    with_pay: newLeaveData.withPay ? '1' : '0', // Consistent with your Sybase logic
    reason: newLeaveData.reason,
  }

  try {
    const response = await leaveApi.upsertLeave(authStore.accessToken, payload)
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
  console.log(apprvd)
  return apprvd === '1' || apprvd === 'Y' || apprvd === 1 ? 'success' : 'warning'
}

const openDialog = (item: LeaveApplication | null = null) => {
  console.log('Opening dialog with item:', item)
  selectedItem.value = item
  dialog.value = true
}

const editLeave = (item: LeaveApplication) => {
  console.log('Editing:', item.emp_no)
  isView.value = false
  openDialog(item)
}

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
        console.log('Leave deleted successfully')
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
