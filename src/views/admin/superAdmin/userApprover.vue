<template>
  <v-container fluid class="pa-0">
    <v-card variant="flat" class="rounded-0 min-vh-100">
      <v-row class="mb-4">
        <v-col>
          <h2 class="text-h4 font-weight-bold">Authorization Manager</h2>
          <div class="text-subtitle-1 text-medium-emphasis">
            Assign approval rights per employee.
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="5">
          <v-select
            v-model="selectedApprover"
            :items="approvers"
            item-title="fullName"
            item-value="emp_no"
            label="Select Approver (Manager)"
            prepend-inner-icon="mdi-account-tie"
            variant="outlined"
            color="primary"
            return-object
          ></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <!-- <v-select
            v-model="selectedDept"
            :items="departments"
            item-title="description"
            item-value="dept_code"
            label="Select Department"
            prepend-inner-icon="mdi-office-building"
            variant="outlined"
          ></v-select> -->
        </v-col>
        <v-col cols="12" md="5">
          <v-select
            v-model="selectedCompany"
            :items="companies"
            item-title="company_name"
            item-value="company_code"
            label="Select Company"
            prepend-inner-icon="mdi-office-building"
            variant="outlined"
            return-object
          ></v-select>
        </v-col>
      </v-row>

      <v-row v-if="employees.length > 0" class="justify-end">
        <v-col cols="auto">
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save-all"
            :loading="isLoading"
            @click="saveAllAssignments"
          >
            Save All Changes
          </v-btn>
        </v-col>
      </v-row>

      <v-card variant="outlined" class="mt-4">
        <v-data-table
          :headers="headers"
          :items="employees"
          :loading="isLoading"
          class="striped-table"
          hover
        >
          <template v-slot:[`header.canApproveLeave`]>
            <div class="d-flex align-center justify-center">
              <v-checkbox
                v-model="selectAllLeave"
                hide-details
                density="compact"
                color="success"
                class="mr-2"
              ></v-checkbox>
              Leave Approval
            </div>
          </template>

          <template v-slot:[`header.canApproveOT`]>
            <div class="d-flex align-center justify-center">
              <v-checkbox
                v-model="selectAllOT"
                hide-details
                density="compact"
                color="info"
                class="mr-2"
              ></v-checkbox>
              OT Approval
            </div>
          </template>

          <template v-slot:[`header.canApproveAttendance`]>
            <div class="d-flex align-center justify-center">
              <v-checkbox
                v-model="selectAllAttendance"
                hide-details
                density="compact"
                color="info"
                class="mr-2"
              ></v-checkbox>
              Attendance Approval
            </div>
          </template>

          <template v-slot:[`header.canApproveTravelOrder`]>
            <div class="d-flex align-center justify-center">
              <v-checkbox
                v-model="selectAllTravelOrder"
                hide-details
                density="compact"
                color="info"
                class="mr-2"
              ></v-checkbox>
              Travel Order Approval
            </div>
          </template>
          <template v-slot:[`header.canApproveChangeOff`]>
            <div class="d-flex align-center justify-center">
              <v-checkbox
                v-model="selectAllChangeOff"
                hide-details
                density="compact"
                color="info"
                class="mr-2"
              ></v-checkbox>
              Change Day Off Approval
            </div>
          </template>

          <template v-slot:[`item.fullName`]="{ item }">
            <div class="py-2">
              <div class="font-weight-bold">{{ item.fullName }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ item.emp_no }} • {{ item.position }}
              </div>
            </div>
          </template>

          <template v-slot:[`item.canApproveLeave`]="{ item }">
            <div class="d-flex justify-center align-center w-100">
              <v-switch
                v-model="item.canApproveLeave"
                :color="item.canApproveLeave ? 'green-accent-3' : ''"
                hide-details
              >
                <template v-slot:label>
                  <v-icon
                    :icon="item.canApproveLeave ? 'mdi-calendar-check' : 'mdi-calendar-blank'"
                    :color="item.canApproveLeave ? 'green-accent-3' : ''"
                    size="small"
                    class="mr-1"
                  />
                </template>
              </v-switch>
            </div>
          </template>

          <template v-slot:[`item.canApproveOT`]="{ item }">
            <div class="d-flex justify-center align-center w-100">
              <v-switch
                v-model="item.canApproveOT"
                :color="item.canApproveOT ? 'blue-lighten-1' : ''"
                hide-details
              >
                <template v-slot:label>
                  <v-icon
                    :icon="item.canApproveOT ? 'mdi-clock-check' : 'mdi-clock-outline'"
                    :color="item.canApproveOT ? 'blue-lighten-1' : ''"
                    size="small"
                    class="mr-1"
                  />
                </template>
              </v-switch>
            </div>
          </template>
          <template v-slot:[`item.canApproveAttendance`]="{ item }">
            <div class="d-flex justify-center align-center w-100">
              <v-switch
                v-model="item.canApproveAttendance"
                :color="item.canApproveAttendance ? 'purple-darken-1' : ''"
                hide-details
              >
                <template v-slot:label>
                  <v-icon
                    :icon="
                      item.canApproveAttendance
                        ? 'mdi-clipboard-account'
                        : 'mdi-clipboard-account-outline'
                    "
                    :color="item.canApproveAttendance ? 'purple-darken-1' : ''"
                    size="small"
                    class="mr-1"
                  />
                </template>
              </v-switch>
            </div>
          </template>
          <template v-slot:[`item.canApproveTravelOrder`]="{ item }">
            <div class="d-flex justify-center align-center w-100">
              <v-switch
                v-model="item.canApproveTravelOrder"
                :color="item.canApproveTravelOrder ? 'teal-lighten-1' : 'warning'"
                hide-details
              >
                <template v-slot:label>
                  <v-icon
                    :icon="
                      item.canApproveTravelOrder ? 'mdi-truck-check' : 'mdi-truck-check-outline'
                    "
                    :color="item.canApproveTravelOrder ? 'teal-lighten-1' : ''"
                    size="small"
                    class="mr-1"
                  />
                </template>
              </v-switch>
            </div>
          </template>

          <template v-slot:[`item.canApproveChangeOff`]="{ item }">
            <div class="d-flex justify-center align-center w-100">
              <v-switch
                v-model="item.canApproveChangeOff"
                :color="item.canApproveChangeOff ? 'orange-lighten-1' : 'warning'"
                hide-details
              >
                <template v-slot:label>
                  <v-icon
                    :icon="item.canApproveChangeOff ? 'mdi-sun-clock' : 'mdi-sun-clock-outline'"
                    :color="item.canApproveChangeOff ? 'orange-lighten-1' : ''"
                    size="small"
                    class="mr-1"
                  />
                </template>
              </v-switch>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import authApi from '@/Api/Admin'
import { useAuthStore } from '@/stores/auth'

// Interfaces
interface Employee {
  emp_no: string
  fullName: string
  position: string
  company_code: string
  canApproveLeave: boolean
  canApproveOT: boolean
  canApproveAttendance: boolean
  canApproveTravelOrder: boolean
  canApproveChangeOff: boolean
}

// Interfaces
interface Approver {
  emp_no: string
  fullName: string
}
interface Department {
  dept_code: string
  description: string
}
interface Division {
  div_code: string
  dept_code: string
  description: string
}

interface Company{
  company_code: string
  company_name: string
}

const headers = [
  { title: 'Employee Details', key: 'fullName', width: '25%' },
  { title: 'Leave Approval', key: 'canApproveLeave', align: 'center' as const },
  { title: 'OT Approval', key: 'canApproveOT', align: 'center' as const },
  { title: 'Attendance Approval', key: 'canApproveAttendance', align: 'center' as const },
  { title: 'Travel Order Approval', key: 'canApproveTravelOrder', align: 'center' as const },
  { title: 'Change Off Approval', key: 'canApproveChangeOff', align: 'center' as const },
]

const authStore = useAuthStore()
const approvers = ref<Approver[]>([])
const departments = ref<Department[]>([])
const divisions = ref<Division[]>([])
const selectedApprover = ref<Approver | null>(null)
const selectedDept = ref<Department | null>(null)
const selectedDivision = ref<Division | null>(null)
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const companies = ref<Company[]>([])
const selectedCompany = ref<Company | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    await loadDeparments()
    await loadApprovers()
    await loanCompanies()
  } catch (error) {
    console.error('Failed to fetch data', error)
  } finally {
    isLoading.value = false
  }
})

const loadApprovers = async () => {
  try {
    const response = await authApi.FetchEmployeeByRole(authStore.accessToken, 'approver')
    approvers.value = response.data.employees
  } catch (error) {
    console.error('Failed to fetch approvers', error)
  }
}

const loadDeparments = async () => {
  try {
    const response = await authApi.FetchDepartments(authStore.accessToken)
    departments.value = response.data.departments
  } catch (error) {
    console.error('Failed to fetch departments', error)
  }
}

const loanCompanies = async () => {
  try {
    const response = await authApi.FetchCompanies(authStore.accessToken)
    companies.value = response.data.companies
  } catch (error) {
    console.error('Failed to fetch companies', error)
  }
}

const selectAllLeave = computed({
  get: () => employees.value.length > 0 && employees.value.every((e) => e.canApproveLeave),
  set: (v: boolean) => employees.value.forEach((e) => (e.canApproveLeave = v)),
})

const selectAllOT = computed({
  get: () => employees.value.length > 0 && employees.value.every((e) => e.canApproveOT),
  set: (v: boolean) => employees.value.forEach((e) => (e.canApproveOT = v)),
})

const selectAllAttendance = computed({
  get: () => employees.value.length > 0 && employees.value.every((e) => e.canApproveAttendance),
  set: (v: boolean) => employees.value.forEach((e) => (e.canApproveAttendance = v)),
})

const selectAllTravelOrder = computed({
  get: () => employees.value.length > 0 && employees.value.every((e) => e.canApproveTravelOrder),
  set: (v: boolean) => employees.value.forEach((e) => (e.canApproveTravelOrder = v)),
})

const selectAllChangeOff = computed({
  get: () => employees.value.length > 0 && employees.value.every((e) => e.canApproveChangeOff),
  set: (v: boolean) => employees.value.forEach((e) => (e.canApproveChangeOff = v)),
})

watch(selectedDept, async (newDept) => {
  selectedDivision.value = null
  divisions.value = []
  employees.value = []
  if (newDept) {
    await loadDivision(newDept.dept_code)
  }
})

watch([selectedApprover, selectedDivision], async ([newApp, newDiv]) => {
  if (newApp && newDiv) {
    isLoading.value = true
    try {
      await loadEmployees(newApp.emp_no, newDiv.dept_code, newDiv.div_code)
    } finally {
      isLoading.value = false
    }
  } else {
    employees.value = []
  }
})

watch([selectedCompany, selectedApprover], async ([newCompany, newApprover]) => {
  if (newCompany && newApprover) {
    isLoading.value = true
    try {
      await loadEmployeesByCompany(newCompany.company_code, newApprover.emp_no)
    } finally {
      isLoading.value = false
    }
  } else {
    employees.value = []
  }
})

const loadDivision = async (department: string) => {
  try {
    const response = await authApi.FetchDivisionByDepartment(authStore.accessToken, department)
    const allOption = { div_code: 'ALL', dept_code: department, description: 'All' }
    divisions.value = [allOption, ...response.data.divisions]
  } catch (error) {
    console.error('Failed to fetch divisions', error)
  }
}

const loadEmployees = async (approver: string, department: string, division: string) => {
  try {
    const response = await authApi.FetchEmployeeByDepartment(
      authStore.accessToken,
      approver,
      department,
      division,
    )

    employees.value = response.data.employees.map((emp: Record<string, unknown>) => ({
      ...emp,
      canApproveLeave: !!emp.canApproveLeave, // or emp.canApproveLeave === 1
      canApproveOT: !!emp.canApproveOT, // or emp.canApproveOT === 1
      canApproveAttendance: !!emp.canApproveAttendance, // or emp.canApproveAttendance === 1
      canApproveTravelOrder: !!emp.canApproveTravelOrder, // or emp.canApproveTravelOrder === 1
      canApproveChangeOff: !!emp.canApproveChangeOff, // or emp.canApproveChageOff === 1
    })) as Employee[]
  } catch (error) {
    console.error('Failed to fetch employees', error)
  }
}

const loadEmployeesByCompany = async (companyCode: string, empNo: string) => {
  try {
    const response = await authApi.FetchEmployeesByCompany(
      authStore.accessToken,
      companyCode,
      empNo,
    )

    employees.value = response.data.employees.map((emp: Record<string, unknown>) => ({
      ...emp,
      canApproveLeave: !!emp.canApproveLeave, // or emp.canApproveLeave === 1
      canApproveOT: !!emp.canApproveOT, // or emp.canApproveOT === 1
      canApproveAttendance: !!emp.canApproveAttendance, // or emp.canApproveAttendance === 1
      canApproveTravelOrder: !!emp.canApproveTravelOrder, // or emp.canApproveTravelOrder === 1
      canApproveChangeOff: !!emp.canApproveChangeOff, // or emp.canApproveChageOff === 1
    })) as Employee[]
  } catch (error) {
    console.error('Failed to fetch employees by company', error)
  }
}

const saveAllAssignments = async () => {
  if (!selectedApprover.value) return

  try {
    isLoading.value = true

    // Map the current employee list into a simple payload
    const payload = employees.value.map((emp) => ({
      subordinate_id: emp.emp_no,
      allow_leave: emp.canApproveLeave ? 1 : 0,
      allow_ot: emp.canApproveOT ? 1 : 0,
      allow_attendance: emp.canApproveAttendance ? 1 : 0,
      allow_travel: emp.canApproveTravelOrder ? 1 : 0,
      allow_changeOff: emp.canApproveChangeOff ? 1 : 0,
    }))

    await authApi.SaveBulkApproverPermission(authStore.accessToken, {
      approver_id: selectedApprover.value?.emp_no,
      assignments: payload,
    })

    // Optional: Show a success snackbar
    alert('Assignments saved successfully!')
  } catch (error) {
    console.error('Bulk save failed', error)
  } finally {
    isLoading.value = false
  }
}
</script>
