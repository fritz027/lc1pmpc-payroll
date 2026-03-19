<template>
  <v-container fluid class="pa-0">
    <v-card variant="flat" class="rounded-0 min-vh-100">
      <v-card-title class="d-flex align-center py-4 px-6">
        <v-icon icon="mdi-calendar-sync" class="mr-2" />
        Change Day-Off Request
        <v-spacer />
        <v-btn
          v-if="selection.from || selection.to"
          color="error"
          variant="tonal"
          prepend-icon="mdi-refresh"
          @click="resetSelection"
        >
          Reset Selection
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-alert type="info" variant="tonal" class="ma-4" border="start">
        <div class="text-subtitle-1 font-weight-bold">Instructions:</div>
        1. Select your current <strong>Day-Off (Special or Regular)</strong>. 2. Select the
        <strong>Work Day (Normal)</strong> you want to swap it with.
      </v-alert>
      <v-card elevation="2" class="rounded-lg border">
        <v-data-table
          :items="schedule"
          :headers="headers"
          :items-per-page="-1"
          hide-default-footer
          class="striped-table"
          hover
          @click:row="handleRowClick"
        >
          <template v-slot:item.shift_date="{ value }">
            <span class="font-weight-medium">{{ formatDateOnly(value) }}</span>
          </template>

          <template v-slot:item.shift_type="{ value }">
            <v-chip :color="getStatusColor(value)" size="small" label class="font-weight-bold">
              {{ value === 'N' ? 'NORMAL' : value === 'P' ? 'SPECIAL OFF' : 'REG OFF' }}
            </v-chip>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip
              v-if="item.request_status === 'P'"
              color="warning"
              size="x-small"
              variant="flat"
            >
              PENDING
            </v-chip>

            <v-chip
              v-else-if="item.request_status === 'A'"
              color="info"
              size="x-small"
              variant="flat"
            >
              SWAPPED
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

            <template v-else>
              <v-btn
                v-if="item.request_status === 'P'"
                size="small"
                color="error"
                variant="tonal"
                prepend-icon="mdi-close-circle"
                @click="cancelRequest(item)"
              >
                Cancel Request
              </v-btn>

              <v-btn
                v-else
                :variant="isItemSelected(item) ? 'elevated' : 'outlined'"
                size="small"
                :color="getButtonColor(item)"
                :disabled="isButtonDisabled(item) || item.request_status === 'A'"
                :prepend-icon="isItemSelected(item) ? 'mdi-check-circle' : 'mdi-plus'"
                @click="handleSelection(item)"
              >
                {{ item.request_status === 'A' ? 'Swapped' : getButtonText(item) }}
              </v-btn>
            </template>
          </template>
        </v-data-table>
      </v-card>
      <v-dialog v-model="confirmDialog" max-width="500" @click:outside="resetSelection">
        <v-card
          :prepend-icon="isViewMode ? 'mdi-eye' : 'mdi-swap-horizontal'"
          :title="isViewMode ? 'View Pending Request' : 'Confirm Day-Off Swap'"
        >
          <v-divider />

          <v-card-text class="pa-6">
            <div class="text-body-1 mb-4">
              {{
                isViewMode
                  ? 'Details of your pending request:'
                  : 'You are requesting to swap these days:'
              }}
            </div>

            <v-sheet border rounded class="pa-3 mb-3 bg-grey-lighten-4">
              <div class="text-caption text-uppercase">Current Day-Off</div>
              <div class="text-h6 text-blue-darken-2">
                {{ formatDateOnly(selection.from?.shift_date || '') }}
              </div>
            </v-sheet>

            <v-sheet v-if="selection.to" border rounded class="pa-3 bg-grey-lighten-4">
              <div class="text-caption text-uppercase">Target Work Day</div>
              <div class="text-h6 text-green-darken-2">
                {{ formatDateOnly(selection.to?.shift_date || '') }}
              </div>
            </v-sheet>

            <v-textarea
              v-model="reason"
              label="Reason for Swap"
              variant="outlined"
              class="mt-4"
              :readonly="isViewMode"
              hide-details
            />
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-btn
              v-if="isViewMode"
              color="error"
              variant="tonal"
              @click="cancelRequest(selection)"
            >
              Cancel Request
            </v-btn>

            <v-spacer />

            <v-btn variant="text" @click="confirmDialog = false">Close</v-btn>

            <v-btn
              v-if="!isViewMode"
              color="primary"
              variant="elevated"
              :loading="submitting"
              @click="submitRequest"
            >
              Submit for Approval
            </v-btn>
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

// Types (Keep these for TS safety)
export type ShiftType = 'N' | 'P' | 'G'
export interface EmpShift {
  emp_no: string
  shift_date: string
  shift_code: string
  shift_type: ShiftType
  ot_spcl: number | null
  request_id?: number // For pending/approved requests
  request_status?: 'P' | 'A' | null // P = Pending, A = Approved/Swapped
}

const authStore = useAuthStore()
const schedule = ref<EmpShift[]>([])
const selection = ref<{ from: EmpShift | null; to: EmpShift | null; request_id: number | null }>({
  from: null,
  to: null,
  request_id: null,
})
const confirmDialog = ref(false)
const submitting = ref(false)
const reason = ref('')
const isViewMode = ref(false)
const isPosted = ref(false)

const headers = [
  { title: 'Date', key: 'shift_date', align: 'start' as const },
  { title: 'Shift Code', key: 'shift_code' },
  { title: 'Type', key: 'shift_type' },
  { title: 'Status', key: 'status', align: 'center' as const },
  { title: 'Action', key: 'actions', sortable: false, align: 'end' as const },
]

const resetSelection = () => {
  selection.value = { from: null, to: null, request_id: null }
  loadSchedule()
  reason.value = ''
  isViewMode.value = false
}

const isItemSelected = (item: EmpShift) => {
  return (
    selection.value.from?.shift_date === item.shift_date ||
    selection.value.to?.shift_date === item.shift_date
  )
}

const isButtonDisabled = (item: any) => {
  // Disable if it's already pending or approved
  if (item.request_status === 'P' || item.request_status === 'A') return true

  if (!selection.value.from) return item.shift_type === 'N'
  if (selection.value.from && !selection.value.to) {
    if (selection.value.from.shift_date === item.shift_date) return false
    return item.shift_type !== 'N'
  }
  return false
}

const handleSelection = (item: any) => {
  // 1. VIEW PENDING MODE
  if (item.request_status === 'P') {
    isViewMode.value = true

    // Map the new SQL columns directly to the UI
    selection.value.from = { shift_date: item.original_off_date } as any
    selection.value.to = { shift_date: item.requested_off_date } as any
    selection.value.request_id = item.request_id
    reason.value = item.reason || 'No reason provided.'
    confirmDialog.value = true
    return
  }

  // 2. NORMAL SWAP MODE
  isViewMode.value = false
  if (item.shift_type === 'P' || item.shift_type === 'G') {
    selection.value.from = item
  } else if (selection.value.from && item.shift_type === 'N') {
    selection.value.to = item
    confirmDialog.value = true
  }
}

const getButtonText = (item: EmpShift) => {
  if (selection.value.from?.shift_date === item.shift_date) return 'Selected (Off)'
  if (selection.value.to?.shift_date === item.shift_date) return 'Selected (Work)'

  if (!selection.value.from) {
    return item.shift_type === 'P' || item.shift_type === 'G' ? 'Pick Off Day' : 'Work Day'
  }
  return item.shift_type === 'N' ? 'Pick to Swap' : 'Off Day'
}

const getButtonColor = (item: EmpShift) => {
  if (isItemSelected(item)) return 'success'
  return 'primary'
}

const getStatusColor = (type: ShiftType) => {
  const colors = { N: 'green', P: 'blue', G: 'orange' }
  return colors[type] || 'grey'
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

const loadSchedule = async () => {
  const from = authStore.payrollInit?.pay_fr ? formatDateOnly(authStore.payrollInit.pay_fr) : null
  const to = authStore.payrollInit?.pay_to ? formatDateOnly(authStore.payrollInit.pay_to) : null
  isPosted.value = authStore.payrollInit?.posted === '1'
  if (!from || !to) return

  const response = await Api.GetShiftSchedule(from, to, authStore.accessToken)
  schedule.value = response.data.schedule
}

const submitRequest = async () => {
  if (!selection.value.from || !selection.value.to) return
  if (!reason.value.trim()) {
    alert('Please provide a reason for the swap.')
    return
  }
  submitting.value = true
  try {
    const payload = {
      emp_no: authStore.employee?.employeeNo || '',
      original_off_date: selection.value.from.shift_date,
      requested_off_date: selection.value.to.shift_date,
      reason: reason.value,
    }

    await Api.SubmitChangeDayRequest(
      {
        ...payload,
      },
      authStore.accessToken,
    )
    confirmDialog.value = false
    resetSelection()
    // Optional: show a success snackbar here
  } catch (error) {
    console.error('Submission failed', error)
  } finally {
    submitting.value = false
  }
}

const cancelRequest = async (item: any) => {
  if (!confirm('Are you sure you want to cancel this pending request?')) return
  try {
    const res = await Api.CancelChangeDayRequest(item.request_id, authStore.accessToken)

    // Close the dialog and refresh the table
    confirmDialog.value = false
    await loadSchedule()
    resetSelection()
  } catch (error) {
    console.error('Failed to cancel request', error)
  }
}

const handleRowClick = (event: Event, row: { item: EmpShift }) => {
  handleSelection(row.item)
}

watch(
  () => [authStore.payrollInit?.pay_fr, authStore.payrollInit?.pay_to],
  ([newFrom, newTo]) => {
    if (newFrom && newTo) {
      loadSchedule()
    }
  },
  { immediate: true },
)

onMounted(loadSchedule)
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

.striped-table :deep(tr.v-data-table__tr) {
  cursor: pointer;
}
</style>
