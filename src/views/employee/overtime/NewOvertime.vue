<template>
  <v-container max-width="800">
    <v-card class="pa-4 pa-sm-6" elevation="3">
      <v-card-title class="text-h5 font-weight-bold mb-4 px-0">
        {{ isEditMode ? 'Edit Overtime' : 'File New Overtime' }}
      </v-card-title>
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-form @submit.prevent="handleSave" ref="overtimeForm" v-model="isFormValid">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formData.ot_date"
              label="Date of Overtime"
              type="date"
              variant="outlined"
              density="comfortable"
              :rules="[(v: any) => !!v || 'Overtime Date is required']"
              :readonly="isEditMode"
              clearable
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="mb-4 mt-2"></v-divider>

        <h3 class="text-subtitle-1 font-weight-medium mb-2 text-primary">Advance Time</h3>
        <v-row>
          <v-col cols="12" sm="6" class="py-2">
            <v-text-field
              v-model="formData.adv_time_in"
              label="Advance Time In"
              type="time"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-2">
            <v-text-field
              v-model="formData.adv_time_out"
              label="Advance Time Out"
              type="time"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="mb-4 mt-2"></v-divider>

        <h3 class="text-subtitle-1 font-weight-medium mb-2 text-primary">Regular Overtime</h3>
        <v-row>
          <v-col cols="12" sm="6" class="py-2">
            <v-text-field
              v-model="formData.ot_time_in"
              label="Overtime Time In"
              type="time"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-2">
            <v-text-field
              v-model="formData.ot_time_out"
              label="Overtime Time Out"
              type="time"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="mb-4 mt-2"></v-divider>

        <h3 class="text-subtitle-1 font-weight-medium mb-2 text-primary">Break Time</h3>
        <v-row>
          <v-col cols="12" sm="6" class="py-2">
            <v-text-field
              v-model="formData.ot_brktime_out"
              label="Break Time Out (Start Break)"
              type="time"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-2">
            <v-text-field
              v-model="formData.ot_brktime_in"
              label="Break Time In (End Break)"
              type="time"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12" class="d-flex justify-end gap-2">
            <v-btn @click="handleClose" color="grey-darken-1" variant="text">Cancel</v-btn>
            <v-btn
              :disabled="!canSubmit"
              color="primary"
              type="submit"
              prepend-icon="mdi-content-save"
            >
              {{ isEditMode ? 'Update Overtime' : 'Save Overtime' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['close', 'saved'])
const authStore = useAuthStore()
const isFormValid = ref(false)
const errorMessage = ref('')
const overtimeForm = ref<any>(null)

const props = defineProps<{ editData: any | null }>()
const isEditMode = computed(() => !!props.editData)

// Reactive form object holding all the fields
const formData = ref({
  ot_date: '',
  adv_time_in: '',
  adv_time_out: '',
  ot_time_in: '',
  ot_time_out: '',
  ot_brktime_out: '',
  ot_brktime_in: '',
})

const handleClose = () => {
  emit('close')
}

const formatForDateInput = (rawDate: string | null) => {
  if (!rawDate) return ''
  return rawDate.split(' ')[0].split('T')[0]
}

const formatForTimeInput = (rawTime: string | null) => {
  if (!rawTime) return ''
  const timePart = rawTime.includes('T') ? rawTime.split('T')[1] : rawTime.split(' ')[1]
  if (timePart) {
    return timePart.substring(0, 5)
  }
  return ''
}

onMounted(() => {
  if (props.editData) {
    formData.value.ot_date = formatForDateInput(props.editData.ot_date)
    formData.value.adv_time_in = formatForTimeInput(props.editData.adv_time_in)
    formData.value.adv_time_out = formatForTimeInput(props.editData.adv_time_out)
    formData.value.ot_time_in = formatForTimeInput(props.editData.ot_time_in)
    formData.value.ot_time_out = formatForTimeInput(props.editData.ot_time_out)
    formData.value.ot_brktime_out = formatForTimeInput(props.editData.ot_brktime_out)
    formData.value.ot_brktime_in = formatForTimeInput(props.editData.ot_brktime_in)
  }
})

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

const hasTimeEntries = computed(() => {
  const hasAdvanceOT = !!(formData.value.adv_time_in || formData.value.adv_time_out)
  const hasRegularOT = !!(formData.value.ot_time_in || formData.value.ot_time_out)

  return hasAdvanceOT || hasRegularOT
})

// Combines the Vuetify form validation (Date required) with your custom time requirement
const canSubmit = computed(() => {
  return isFormValid.value && hasTimeEntries.value
})

const handleSave = () => {
  try {
    errorMessage.value = ''
    const dateFrom = authStore.payrollInit?.pay_fr ?? ''
    const dateTo = authStore.payrollInit?.pay_to ?? ''
    if (formData.value.ot_date < dateFrom || formData.value.ot_date > dateTo) {
      errorMessage.value = `Validation Failed: Overtime date must be between ${formatDate(dateFrom)} and ${formatDate(dateTo)}}.`
      return
    }

    emit('saved', formData.value, isEditMode.value)
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
/* Adds a small gap between the cancel and save buttons */
.gap-2 {
  gap: 8px;
}
</style>
