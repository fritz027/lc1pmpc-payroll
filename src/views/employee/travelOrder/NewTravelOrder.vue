<template>
  <v-container class="fill-height justify-center">
    <v-responsive max-width="700">
      <v-card elevation="2" class="pa-4">
        <v-card-item>
          <v-card-title class="text-h5 font-weight-bold mb-2">
            <v-icon icon="mdi-airplane-takeoff" color="primary" class="me-2" />
            {{ isEditMode ? 'Edit Travel Order' : 'New Travel Order' }}
          </v-card-title>
          <v-card-subtitle>Fill in the details to request a travel pass.</v-card-subtitle>
        </v-card-item>

        <v-divider class="mb-4"></v-divider>

        <v-card-text>
          <v-form ref="form" v-model="isValid" @submit.prevent="submitTravelOrder">
            <v-row>
              <v-col cols="12" v-if="isEditMode">
                <v-text-field
                  v-model="formData.travel_passno"
                  label="Pass Number"
                  variant="outlined"
                  readonly
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.travel_dt_out"
                  label="Travel Date Out"
                  type="datetime-local"
                  required
                  :rules="[(v: any) => !!v || 'Departure date is required']"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.travel_dt_in"
                  label="Travel Date In"
                  type="datetime-local"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.destination"
                  label="Destination"
                  placeholder="City, Country or Office Location"
                  required
                  maxlength="30"
                  :rules="[(v: any) => !!v || 'Destination is required']"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.reason"
                  label="Reason for Travel"
                  rows="2"
                  variant="outlined"
                  counter="50"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.remarks"
                  label="Additional Remarks"
                  variant="outlined"
                  counter="50"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-card-actions class="mt-4">
              <v-spacer></v-spacer>
              <v-btn variant="text" color="grey-darken-1" @click="handleClose">Close</v-btn>
              <v-btn
                color="primary"
                type="submit"
                variant="elevated"
                :disabled="!isValid"
                prepend-icon="mdi-content-save"
              >
                {{ isEditMode ? 'Update Order' : 'Save Order' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['close', 'saved'])
const props = defineProps<{ editData: any | null }>()
const isEditMode = computed(() => !!props.editData)

const authStore = useAuthStore()
const form = ref<any>(null)
const isValid = ref(false)

// Initial state matching your SQL table structure
const formData = reactive({
  emp_no: '',
  travel_passno: '',
  travel_dt_out: '',
  travel_dt_in: '',
  destination: '',
  reason: '',
  remarks: '',
  approved: 0, // Default per your schema
})

const handleClose = () => {
  emit('close')
}

const formatForInput = (date: string) => {
  if (!date) return ''
  const d = new Date(date)

  // Adjust for local timezone offset
  const offset = d.getTimezoneOffset() * 60000
  const localISOTime = new Date(d.getTime() - offset).toISOString()

  // Result: 2026-03-18T02:50 (strips seconds and milliseconds)
  return localISOTime.slice(0, 16)
}

onMounted(() => {
  if (props.editData) {
    formData.travel_passno = props.editData.travel_passno
    formData.travel_dt_out = formatForInput(props.editData.travel_dt_out)
    formData.travel_dt_in = formatForInput(props.editData.travel_dt_in)
    formData.destination = props.editData.destination
    formData.reason = props.editData.reason
    formData.remarks = props.editData.remarks
  }
})

const submitTravelOrder = async () => {
  if (!form.value) return
  const { valid } = await form.value.validate()
  if (valid) {
    // The parent component will handle the API call.
    // We just emit the data.
    emit('saved', formData, isEditMode.value)
  }
}
</script>
