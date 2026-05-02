<template>
  <v-container class="py-4">
    <v-card class="rounded-2xl pa-6 elevation-2">
      <v-card-title class="text-h6 font-weight-semibold mb-4">
        <v-row justify="space-between">
          <v-col cols="12" sm="6" md="4">
            <div>Employee Suggetions</div>
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" prepend-icon="mdi-plus" class="rounded-xl" @click="onCreate">
              New Suggetions
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-row align="center" justify="space-between" class="mb-4">
          <v-col cols="12">
            <v-data-table
              :headers="headers"
              :items="suggestions"
              class="elevation-0 rounded-2xl striped-table"
            >
              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  :color="ItemStatus(item.status).color"
                  class="text-white rounded-lg cursor-pointer"
                  size="small"
                >
                  {{ ItemStatus(item.status).label }}
                </v-chip>
              </template>
              <template v-slot:[`item.dateCreated`]="{ item }">
                <div>{{ formatDate(item.dateCreated, 'DD-MM-YYYY') }}</div>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-row justify="center" align="center" class="ma-0" dense>
                  <v-btn
                    icon="mdi-file-eye"
                    size="small"
                    variant="text"
                    @click="ViewSuggestion(item)"
                  />
                </v-row>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <!-- Result Dialog -->
    <v-dialog v-model="showDialog" max-width="850">
      <v-card>
        <v-card-title class="text-h6"> View Suggestion </v-card-title>
        <v-card-text>
          <div>
            <v-text-field v-model="title" label="Title" readonly></v-text-field>
          </div>
          <div>
            <v-textarea v-model="suggestion" label="Suggestion" readonly />
          </div>
          <div
            v-if="preview.length"
            style="display: flex; justify-content: center; margin-top: 10px"
          >
            <img
              v-for="(pre, i) in preview"
              :key="i"
              :src="pre.url"
              style="max-width: 400px; max-height: 400px"
              alt="Image Preview"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false">close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import employeApi from '@/Api/Employee'
import type { Suggestions } from '@/types/general'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const suggestions = ref<Suggestions[]>([])
const showDialog = ref<Boolean>(false)
const title = ref<String>('')
const suggestion = ref<String>('')
const preview = ref<{ type: 'image'; url: string; originalUrl?: string }[]>([])

const formatDate = (dateString: string, dateFormat: string) => {
  return dayjs(dateString).format(dateFormat)
}

onMounted(async () => {
  try {
    const response = await employeApi.fetchEmployeeSuggestions(
      authStore.accessToken,
      authStore.employee?.employeeNo || '',
    )
    if (response.data.success) {
      suggestions.value = response.data.suggestions
    } else {
      console.log(response.data.message)
    }
  } catch (error) {
    console.log(error)
  }
})

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Status', key: 'status' },
  { title: 'Date', key: 'dateCreated' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const ItemStatus = (status: string) => {
  switch (status) {
    case 'O':
      return { label: 'OPEN', color: 'green', icon: 'mdi-lightbulb-on' }
    case 'A':
      return { label: 'ARCHIVED', color: 'red', icon: 'mdi-lightbulb-off' }
    case 'G':
      return { label: 'GOOD', color: 'blue', icon: 'mdi-lightbulb' }
    default:
      return { label: 'UNKNOWN', color: 'black', icon: 'mdi-help-circle' }
  }
}

const ViewSuggestion = async (item: Suggestions) => {
  title.value = ''
  suggestion.value = ''
  preview.value = []
  try {
    const response = await employeApi.fetchEmployeeSuggestionById(
      authStore.accessToken,
      Number(item.id),
      authStore.employee?.employeeNo || '',
    )

    if (!response.data.success) {
      console.log(response.data.message)
      return
    }
    const result = response.data.suggestion[0]
    showDialog.value = true
    title.value = result.title
    suggestion.value = result.suggestion
    const image = result.image
    if (image) {
      preview.value.push({
        type: 'image',
        url: image,
      })
    }
  } catch (error) {
    console.log(error)
  }
}

const onCreate = () => {
  router.push({ name: 'suggestion' })
}
</script>
