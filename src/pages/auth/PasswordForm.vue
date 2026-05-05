<template>
  <v-card class="mx-auto pa-6" max-width="450" rounded="lg" elevation="2">

    <!-- SUCCESS VIEW -->
    <v-fade-transition hide-on-leave>
      <div v-if="successMessage" class="text-center py-8">
        <v-icon color="success" size="80" icon="mdi-check-circle-outline" class="mb-4" />
        <h3 class="text-h5 font-weight-bold mb-2">Verification Successful!</h3>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Your account has been fully verified and your new password is set.
        </p>
        <v-btn color="primary" block rounded="pill" size="large" @click="handleLogin('login')">
          Go to Login
        </v-btn>
      </div>

      <div v-else>
        <div class="text-center mb-6">
          <v-icon color="primary" size="64" icon="mdi-lock-reset" class="mb-2" />
          <h3 class="text-h5 font-weight-bold">Create New Password</h3>
          <p class="text-body-2 text-medium-emphasis">
            Please set a strong password for account <strong>{{ maskedEmail }}</strong>
          </p>
        </div>

        <v-form ref="form" v-model="isFormValid" @submit.prevent="submitPassword">
          <!-- New Password -->
          <v-text-field
            v-model="password"
            :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required, rules.min]"
            :type="show1 ? 'text' : 'password'"
            label="New Password"
            placeholder="Enter your password"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            @click:append-inner="show1 = !show1"
          ></v-text-field>

          <!-- Confirm Password -->
          <v-text-field
            v-model="confirmPassword"
            :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required, passwordMatch]"
            :type="show2 ? 'text' : 'password'"
            label="Confirm Password"
            placeholder="Repeat your password"
            variant="outlined"
            density="comfortable"
            @click:append-inner="show2 = !show2"
          ></v-text-field>

          <!-- Error message from Parent -->
          <v-expand-transition>
            <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              density="compact"
              class="mt-4 text-caption"
            >
              {{ errorMsg }}
            </v-alert>
          </v-expand-transition>

          <v-btn
            :loading="loading"
            :disabled="!isFormValid"
            block
            color="primary"
            size="large"
            type="submit"
            variant="flat"
            class="mt-6 rounded-pill"
          >
            Complete Registration
          </v-btn>
        </v-form>
      </div>
    </v-fade-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';

interface Props {
  email: string;
  empNo: string;
  errorMsg?: string;
  successMessage?: string;
}

interface EmpData {
  email: string;
  empNo: string;
  password: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'submit', data: EmpData): void;
  (e: 'switch', v: string): void;
}>();

const form = ref<HTMLFormElement | null>(null);
const isFormValid = ref(false);
const password = ref('');
const confirmPassword = ref('');
const show1 = ref(false);
const show2 = ref(false);
const loading = ref(false);


const data = reactive({
  email: '',
  empNo: '',
  password: ''
})


const maskedEmail = computed(() => {
  if (!props.email || !props.email.includes('@')) return props.email;

  const [localPart, domain] = props.email.split('@');

  if (localPart.length <= 2) {
    // Fallback for very short emails like a@gmail.com
    return `${localPart[0]}***@${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const mask = '*'.repeat(5); // You can use localPart.length - 2 for exact length masking

  return `${firstChar}${mask}${lastChar}@${domain}`;
});

// Validation Rules
const rules = {
  required: (value: string) => !!value || 'Required.',
  min: (v: string) => v.length >= 8 || 'Min 8 characters',
};

const passwordMatch = computed(() => {
  return () => (password.value === confirmPassword.value) || 'Passwords do not match';
});

const handleLogin = (v: string ) => {
  emit('switch', v);
}

const submitPassword = async () => {
  const { valid } = await form.value?.validate() ?? { valid: false }
  loading.value = true;
  data.password  = password.value
  if (valid) {
    console.log(data);
    emit('submit', { ...data});
  }
  loading.value = false;
};

onMounted (() => {
  data.email = props.email;
  data.empNo = props.empNo
})
</script>
