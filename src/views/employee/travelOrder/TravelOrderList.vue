<template>
  <v-container max-width="800" class="pb-6">
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-bold mb-1">Travel Orders</h2>
        <div
          class="bg-blue-lighten-5 text-blue-darken-3 px-2 py-1 rounded text-caption d-inline-flex align-center"
        >
          <v-icon size="x-small" class="mr-1">mdi-information</v-icon>
          Select a payroll period to view Travel order records.
        </div>
      </v-col>

      <v-col cols="12" md="6" class="text-md-right">
        <v-btn @click="newTravelOrder" color="primary" prepend-icon="mdi-plus"
          >New Travel Order</v-btn
        >
      </v-col>
    </v-row>

    <v-card elevation="2">
      <div class="overflow-x-auto">
        <v-data-table
          :headers="headers"
          :items="travelRecords"
          :loading="loading"
          hover
          class="text-no-wrap striped-table custom-table-border"
        >
          <template v-slot:[`item.dDate`]="{ item }">
            {{ formatDate(item.travel_dt_out) }}
          </template>

          <template v-slot:[`item.travel_dt_out`]="{ item }">
            {{ formatTime(item.travel_dt_out) }}
          </template>

          <template v-slot:[`item.travel_dt_in`]="{ item }">
            {{ formatTime(item.travel_dt_in) }}
          </template>

          <template v-slot:[`item.approved`]="{ item }">
            <v-chip
              :color="item.approved === 1 ? 'success' : 'warning'"
              size="small"
              variant="flat"
            >
              {{ item.approved === 1 ? 'Approved' : 'Pending' }}
            </v-chip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex gap-1 align-center">
              <template v-if="item.approved !== 1">
                <v-tooltip text="Edit Overtime" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil"
                      variant="text"
                      color="blue-grey-darken-1"
                      size="small"
                      @click="editOvertime(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </template>
              <template v-if="item.approved !== 1">
                <v-tooltip text="Edit Overtime" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-trash-can"
                      variant="text"
                      color="red-darken-1"
                      size="small"
                      @click="deleteOvertime(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </template>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="850px" class="pb-10">
      <NewTravelOrder :edit-data="selectedItem" @close="onClose" @saved="onLeaveSaved" />
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
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Api from '@/Api/Employee'
import NewTravelOrder from './NewTravelOrder.vue'

// Updated Interface matching your DB schema
interface TravelOrder {
  emp_no: string
  travel_passno: string
  travel_dt_out: string
  travel_dt_in: string
  destination: string
  reason: string
  remarks: string
  approved: number
}

const loading = ref(false)
const travelRecords = ref<TravelOrder[]>([])
const authStore = useAuthStore()
const dialog = ref(false)
const errorMessage = ref('')
const errorSnack = ref(false)
const selectedItem = ref<TravelOrder | null>(null)

const openDialog = () => {
  dialog.value = true
}

const onClose = () => {
  dialog.value = false
}

const onLeaveSaved = async (newTravelData: TravelOrder, isEditMode: boolean) => {
  try {
    const payload = {
      travel_dt_out: formatForSQLAnywhere(newTravelData.travel_dt_out),
      travel_dt_in: formatForSQLAnywhere(newTravelData.travel_dt_in),
      remarks: newTravelData.remarks,
      destination: newTravelData.destination,
      reason: newTravelData.reason,
      travel_passno: newTravelData.travel_passno,
      emp_no: authStore.employee?.employeeNo ?? '',
      approved: 0,
    }
    if (!isEditMode) {
      const res = await Api.NewEmployeeTravelOrder(authStore.accessToken, payload)
      if (!res.data.success) {
        errorMessage.value = res.data.message
        errorSnack.value = true
        return
      }
    } else {
      const res = await Api.UpdateEmployeeTravelOrder(authStore.accessToken, payload)
      if (!res.data.success) {
        errorMessage.value = res.data.message
        errorSnack.value = true
        return
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    fetchTravelOrders()
    dialog.value = false
  }
}

const newTravelOrder = () => {
  openDialog()
  selectedItem.value = null
}

const editOvertime = (item: TravelOrder) => {
  console.log('Editing:', item.emp_no)
  selectedItem.value = item
  openDialog()
}

/**
 * Converts a JS Date or HTML datetime-local string to SQL Anywhere format
 * @param {Date|string} dateInput - The date from the form or a Date object
 * @returns {string|null} - Format: "YYYY-MM-DD HH:MM:SS"
 */
const formatForSQLAnywhere = (dateInput: string) => {
  if (!dateInput) return null

  const d = new Date(dateInput)

  // Check if date is valid
  if (isNaN(d.getTime())) return null

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  // SQL Anywhere 11 standard: YYYY-MM-DD HH:MM:SS
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Updated Vuetify Data Table Headers
const headers = [
  { title: 'Pass No.', key: 'travel_passno' },
  { title: 'Date', key: 'dDate', align: 'start' },
  { title: 'Time Out', key: 'travel_dt_out' },
  { title: 'Time In', key: 'travel_dt_in' },
  { title: 'Destination', key: 'destination' },
  { title: 'Reason', key: 'reason' },
  { title: 'Remarks', key: 'remarks' },
  { title: 'Status', key: 'approved', align: 'center' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

// Mock Fetch Function
const fetchTravelOrders = async () => {
  loading.value = true
  try {
    // Mock Data with new fields
    if (!authStore.payrollInit) return
    const res = await Api.EmployeeTravelOrders(
      authStore.accessToken,
      formatDateOnly(authStore.payrollInit?.pay_fr) ?? null,
      formatDateOnly(authStore.payrollInit?.pay_to) ?? null,
    )

    travelRecords.value = res.data.travelOrder
  } catch (error) {
    console.error('Failed to fetch overtime:', error)
  } finally {
    loading.value = false
  }
}

// Helper formatting functions
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

const formatTime = (timeString: string | null) => {
  if (!timeString) return '-'
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const deleteOvertime = async (item: TravelOrder) => {
  try {
    if (!confirm('Are you sure you want to delete this overtime record?')) return
    if (!item.travel_passno) return

    const res = await Api.DeleteEmployeeTravelOrder(authStore.accessToken, item.travel_passno)
    if (!res.data.success) {
      errorMessage.value = res.data.message
      errorSnack.value = true
      return
    }
    fetchTravelOrders()
  } catch (error) {
    console.error('Failed to delete overtime:', error)
  }
}

onMounted(() => {
  fetchTravelOrders()
})

watch(
  () => authStore.payrollInit,
  () => fetchTravelOrders(),
  { immediate: true },
)

const handleBackNavigation = () => {
  // Logic to handle back navigation, e.g., reset state or navigate to a specific route
  if (dialog.value) {
    dialog.value = false
  }
}

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
