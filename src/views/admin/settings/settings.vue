<template>
  <v-container class="py-4">
    <v-card class="rounded-2xl pa-6 elevation-2">
      <v-card-title class="text-h5 font-weight-semibold mb-4">Settings</v-card-title>

      <!-- Header Actions -->
      <v-row align="center" justify="space-between" class="mb-4">
        <v-col cols="12">
          <v-card class="rounded-2xl pa-4 elevation-2">
            <v-card-title class="text-h6 font-weight-semibold mb-4">Payslip Setup</v-card-title>
            <v-alert
              v-if="notifMessage"
              border="start"
              class="mb-4"
              elevation="2"
              prominent
              :type="messgeType"
              variant="tonal"
            >
              {{ notifMessage }}
            </v-alert>
            <v-card-text>
              <v-row align="center">
                <v-col cols="auto">
                  <span>Enable Payslip</span>
                </v-col>
                <v-col cols="auto">
                  <v-checkbox v-model="enabled" hide-details></v-checkbox>
                </v-col>
              </v-row>
              <v-row class="d-flex align-center" dense>
                <!-- Date From -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="dateFrom"
                    label="Date From"
                    type="date"
                    outlined
                    dense
                  ></v-text-field>
                </v-col>

                <!-- Date To -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="dateTo"
                    label="Date To"
                    type="date"
                    outlined
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Display the selected dates -->
              <v-row>
                <v-col>
                  <p>Selected Date From: {{ dateFrom }}</p>
                  <p>Selected Date To: {{ dateTo }}</p>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="UpdateSetting">Update Setting</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import adminApi from '@/Api/Admin'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const dateFrom = ref('')
const dateTo = ref('')
const enabled = ref<boolean>(false)
const authStore = useAuthStore()
const notifMessage = ref('')
const messgeType = ref('error')

onMounted(async () => {
  try {
    const response = await adminApi.FetchPayslipSetting(authStore.accessToken)
    if (response.data.success) {
      dateFrom.value = response.data.setting.dateFrom
      dateTo.value = response.data.setting.dateTo
      enabled.value = response.data.setting.enable
    }
  } catch (error) {
    console.log(error)
  }
})

const UpdateSetting = async () => {
  messgeType.value = 'error'
  if (!dateFrom.value || !dateTo.value) {
    notifMessage.value = 'Please select both Date From and Date To'
    console.warn('Please select both Date From and Date To')
    return
  }

  // Format using dayjs to YYYY-MM-DDs
  const formattedFrom = dayjs(dateFrom.value).format('YYYY-MM-DD')
  const formattedTo = dayjs(dateTo.value).format('YYYY-MM-DD')

  // Optional: validation
  if (dayjs(formattedFrom).isAfter(formattedTo)) {
    notifMessage.value = 'Date From cannot be after Date To'
    console.warn('Date From cannot be after Date To')
    return
  }
  try {
    const response = await adminApi.UpdatePayslipSetting(authStore.accessToken, {
      dateFrom: formattedFrom,
      dateTo: formattedTo,
      enable: enabled.value,
    })
    if (response.data.success) {
      messgeType.value = 'success'
      notifMessage.value = response.data.message
      return
    }
    console.log(response)
  } catch (error: any) {
    notifMessage.value = error.response.data.message
    console.log(error)
  }
}
</script>
