<template>
  <v-container>
    <v-card elevation="2" class="rounded-lg">
      <v-toolbar color="white" flat>
        <v-toolbar-title class="font-weight-bold text-grey-darken-3">
          User Access Control
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" prepend-icon="mdi-plus" variant="elevated" @click="openAddDialog">
          Add New User
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        hover
        class="pa-2 striped-table custom-table-border"
      >
        <template #[`item.role_name`]="{ item }">
          <v-chip
            :color="getRoleColor(item.role_name)"
            size="small"
            variant="flat"
            class="text-uppercase font-weight-bold"
          >
            {{ item.description }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex">
            <v-tooltip text="Edit User" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  variant="text"
                  color="blue-darken-2"
                  @click="openEditDialog(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Delete Access" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete-outline"
                  variant="text"
                  color="red-lighten-1"
                  @click="confirmDelete(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-primary text-white">
          <span class="text-h6">{{ isEditing ? 'Edit User Role' : 'New User Assignment' }}</span>
        </v-card-title>

        <v-card-text class="mt-4">
          <v-form ref="formRef">
            <v-autocomplete
              v-if="!isEditing"
              v-model="editedItem.emp_no"
              :items="allEmployees"
              item-title="fullName"
              item-value="emp_no"
              label="Search Employee"
              variant="outlined"
              prepend-inner-icon="mdi-account-search"
              :rules="[formRules.required]"
            />

            <v-text-field
              v-else
              v-model="editedItem.name"
              label="Employee"
              variant="outlined"
              readonly
              disabled
            />

            <v-select
              v-model="editedItem.role_id"
              :items="roles"
              item-title="name"
              item-value="id"
              label="Assigned Role"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-shield-check"
              :rules="[formRules.required]"
            />
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey" @click="closeDialog">Cancel</v-btn>
          <v-btn variant="elevated" color="primary" class="px-6" @click="saveUser">
            {{ isEditing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" elevation="24">
    <div class="d-flex align-center">
      <v-icon start icon="mdi-information-outline" class="mr-2"></v-icon>
      {{ snackbar.message }}
    </div>

    <template #actions>
      <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { VForm } from 'vuetify/components'
import adminService from '@/Api/Admin'
import { useAuthStore } from '@/stores/auth'

interface User {
  id: number | null // Allow null for new users
  emp_no: string
  name: string
  role_id: number | null
  role_name: string
  description: string
}

interface Role {
  id: number
  role_name: string
  description: string
  name: string
}

const formRules = {
  required: (v: string | number | null) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  role: (v: string | null) => !!v || 'Please select a user role',
}

// --- Table Configuration ---
const headers = [
  { title: 'ID', key: 'id', align: 'start' as const },
  { title: 'Employee No', key: 'emp_no', align: 'start' as const },
  { title: 'Full Name', key: 'name', align: 'start' as const },
  { title: 'Role', key: 'role_name', align: 'center' as const },
  { title: 'Actions', key: 'actions', align: 'end' as const, sortable: false },
]

// --- Mock Data ---
const loading = ref(false)
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const allEmployees = ref<{ emp_no: string; fullName: string }[]>([])
const authStore = useAuthStore()
// --- Form Logic ---
const dialog = ref(false)
const isEditing = ref(false)

// This creates a type based on the instance of the VForm component
type VFormInstance = InstanceType<typeof VForm>

const formRef = ref<VFormInstance | null>(null)

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success', // Default color
})

// Helper function to trigger it easily
const showToast = (msg: string, color: string = 'success') => {
  snackbar.message = msg
  snackbar.color = color
  snackbar.show = true
}

const loadUser = async () => {
  loading.value = true
  try {
    // This calls your fetchUserRoles service we created earlier
    const data = await adminService.FetchUserRoles(authStore.accessToken)
    users.value = data.data.userRoles
  } catch (error) {
    console.error('Failed to load users:', error)
    // Optional: show a snackbar error here
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const res = await adminService.FetchRoles(authStore.accessToken)
    roles.value = res.data.roles
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

const loadEmployees = async () => {
  try {
    const res = await adminService.FetchAvailableEmployees(authStore.accessToken)
    allEmployees.value = res.data.employees
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await loadUser()
  await loadRoles()
  await loadEmployees()
})

const defaultItem: User = {
  id: 0,
  emp_no: '',
  name: '',
  role_id: null,
  role_name: '',
  description: '',
}
const editedItem = reactive<User>({ ...defaultItem })

const openAddDialog = () => {
  isEditing.value = false
  Object.assign(editedItem, defaultItem)
  dialog.value = true
}

const openEditDialog = (item: User) => {
  isEditing.value = true
  Object.assign(editedItem, item)
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  if (formRef.value) formRef.value.resetValidation()
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'superadmin':
      return 'deep-purple-accent-4'
    case 'admin':
      return 'red-accent-3'
    case 'approver':
      return 'cyan-darken-1'
    case 'hr':
      return 'orange-accent-1'
    default:
      return 'grey-darken-1'
  }
}

const saveUser = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    if (!editedItem.emp_no || !editedItem.role_id) {
      showToast('Please select both an employee and a role.', 'red-darken-2')
      return
    }

    const res = await adminService.RoleSave(
      editedItem.emp_no,
      editedItem.role_id,
      authStore.accessToken,
    )

    if (res.data.success) {
      await loadUser()
      closeDialog()

      // SUCCESS FEEDBACK
      showToast(isEditing.value ? 'User updated!' : 'User added!', 'green-darken-1')
    }
  } catch (error: unknown) {
    // ERROR FEEDBACK
    const errorMsg =
      (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Connection error'
    showToast(errorMsg, 'red-darken-2')
  } finally {
    loading.value = false
  }
}

const confirmDelete = async (item: User) => {
  if (!confirm(`Remove access for ${item.name}?`)) return

  try {
    const res = await adminService.DeleteUserRole(item.emp_no, authStore.accessToken)
    if (!res.data.success) {
      const errMsg = res.data.message
      showToast(errMsg, 'red-darken-2')
      return
    }
    showToast('Successfully deleted', 'green-darken-1')
    users.value = users.value.filter((u) => u.id !== item.id)
  } catch (error: unknown) {
    console.log(error)
  }
}
</script>
