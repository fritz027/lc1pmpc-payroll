<template>
  <v-container class="py-4">
    <v-card class="rounded-2xl pa-6 elevation-2">
      <v-card-title class="text-h6 font-weight-semibold mb-4">Announcement List</v-card-title>

      <!-- Header Actions -->
      <v-row align="center" justify="space-between" class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            placeholder="Search announcements..."
            prepend-inner-icon="mdi-magnify"
            density="comfortable"
            hide-details
            class="rounded-xl"
            style="max-width: 300px"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" prepend-icon="mdi-plus" class="rounded-xl" @click="onCreate">
            New Announcement
          </v-btn>
        </v-col>
      </v-row>

      <!-- Announcement List -->
      <v-card class="rounded-2xl pa-4 elevation-2">
        <v-data-table :headers="headers" :items="filtered" class="elevation-0 rounded-2xl">
          <template v-slot:[`item.preview`]="{ item }">
            <v-img :src="item.preview" height="50" width="50" class="rounded-lg" cover />
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              :color="item.status === 'O' ? 'green' : 'red'"
              class="text-white rounded-lg"
              size="small"
            >
              {{ item.status === 'O' ? 'OPEN' : 'DONE' }}
            </v-chip>
          </template>

          <template v-slot:[`item.dateCreated`]="{ item }">
            <div>{{ formatDate(item.dateCreated, 'DD-MM-YYYY') }}</div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-row justify="center" align="center" class="ma-0" dense>
              <v-btn icon="mdi-pencil" size="small" variant="text" @click="onEdit(item)" />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="red"
                @click="onDelete(item)"
              />
            </v-row>
          </template>
        </v-data-table>
      </v-card>
    </v-card>
    <!-- Confirmation Dialog -->
    <v-dialog v-model="showDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6"> Confirm Deletion </v-card-title>

        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-2">
            Are you sure you want to delete this announcement?
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false">Cancel</v-btn>
          <v-btn color="red" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Result Dialog -->
    <v-dialog v-model="showDialogSuccess" max-width="400">
      <v-card>
        <v-card-title class="text-h6"> Delete Result </v-card-title>

        <v-card-text>
          <v-alert :type="successDelete ? 'success' : 'error'" variant="tonal" class="mb-2">
            {{ deleteMessage }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialogSuccess = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import adminApi from '@/Api/Admin'
import { useAuthStore } from '@/stores/auth'
import type { Announcements } from '@/types/general'
import dayjs from 'dayjs'

const router = useRouter()
const search = ref<string>('')
const authStore = useAuthStore()
const announcements = ref<Announcements[]>([])
const showDialog = ref<Boolean>(false)
const showDialogSuccess = ref<Boolean>(false)
const successDelete = ref<Boolean>(false)
const toDeleteId = ref<number | null>(null)
const deleteMessage = ref('')

onMounted(async () => {
  try {
    const result = await adminApi.Announcements(authStore.accessToken)
    if (result.data.success) {
      announcements.value = result.data.announcements
    } else {
      console.log(result.data.message)
    }
  } catch (error) {
    console.log(error)
  }
})

const formatDate = (dateString: string, dateFormat: string) => {
  return dayjs(dateString).format(dateFormat)
}

const headers = [
  { title: 'Preview', key: 'preview', sortable: false },
  { title: 'Title', key: 'title' },
  { title: 'Status', key: 'status' },
  { title: 'Created By', key: 'announceBy' },
  { title: 'Date', key: 'dateCreated' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const filtered = computed(() => {
  return announcements.value.filter(
    (a) =>
      a.title.toLowerCase().includes(search.value.toLowerCase()) ||
      a.dateCreated.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const onCreate = () => {
  router.push('/admin/announcement')
}
const onEdit = (item: Announcements) => {
  router.push(`/admin/announcement/edit/${item.id}`)
}
const onDelete = (item: Announcements) => {
  toDeleteId.value = item.id
  showDialog.value = true
}

const confirmDelete = async () => {
  if (!toDeleteId.value) return

  try {
    const response = await adminApi.DeleteAnnouncement(authStore.accessToken, toDeleteId.value)

    showDialog.value = false
    showDialogSuccess.value = true

    if (response.data.success) {
      successDelete.value = true
      deleteMessage.value = response.data.message
      announcements.value = announcements.value.filter((a) => a.id !== toDeleteId.value)
    } else {
      successDelete.value = false
      deleteMessage.value = response.data.message || 'Failed to delete announcement.'
    }
  } catch (error: unknown) {

    showDialog.value = false
    showDialogSuccess.value = true
    successDelete.value = false
    deleteMessage.value =
      (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Unexpected error occurred.'
    console.error('Delete error:', error)
  }
}
</script>

<style scoped></style>
