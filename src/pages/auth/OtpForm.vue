<template>
  <v-card class="mx-auto pa-6 text-center" max-width="450" rounded="lg" elevation="2">
    <v-icon
      :color="flowSource === 'forgot' ? 'warning' : 'success'"
      size="80"
      :icon="flowSource === 'forgot' ? 'mdi-lock-reset' : 'mdi-email-check-outline'"
      class="mb-4"
    />

    <h3 class="text-h5 font-weight-bold mb-2">
      {{ flowSource === 'forgot' ? 'Password Reset' : 'Registration Successful!' }}
    </h3>

    <p class="text-body-2 text-medium-emphasis mb-6">
      We've sent a verification code to <br>
      <span class="font-weight-bold text-high-emphasis">{{ maskedEmail }}</span>.
      {{ flowSource === 'forgot' ? 'Enter the OTP to reset your password.' : 'Please check your inbox for the OTP.' }}
    </p>

    <!-- Display Error Message -->
    <v-expand-transition>
      <div v-if="errMsg" class="text-error text-caption mb-4 font-weight-bold">
        <v-icon icon="mdi-alert-circle" size="small" class="mr-1" />
        {{ errMsg }}
      </div>
    </v-expand-transition>

    <!-- Vuetify OTP Input -->
    <v-otp-input
      v-model="otpValue"
      :loading="loading"
      variant="underlined"
      @finish="handleVerify"
    ></v-otp-input>

    <div class="mt-6">
      <v-btn
        variant="text"
        :disabled="resendTimer > 0"
        @click="handleResend"
        color="primary"
        class="text-none"
      >
        {{ resendTimer > 0 ? `Resend code in ${formatTimer(resendTimer)}` : 'Resend OTP' }}
      </v-btn>
    </div>

    <v-divider class="my-6"></v-divider>

    <v-btn
      variant="outlined"
      color="primary"
      block
      rounded="pill"
      @click="handleNextStep(flowSource === 'forgot' ? 'forgot' : 'register')"
    >
      {{ flowSource === 'forgot' ? 'BACK TO LOGIN' : 'BACK TO REGISTRATION' }}
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue';

// Define Props with TypeScript
interface Props {
  email: string;
  empNo: string;
  errMsg?: string;
  flowSource: 'register' | 'forgot';
}

interface OTPData {
  otp: string;
  email: string;
  employeeNo: string;
}

const props = defineProps<Props>();


// Define Emits with TypeScript
const emit = defineEmits<{
  (e: 'verified', otpData: OTPData): void;
  (e: 'switch', v: string ): void;
  (e: 'resend', empNo: string, email: string): void;
}>();

const otpData = reactive({
  otp: '',
  email: '',
  employeeNo: ''
});

const otpValue = ref<string>('');
const loading = ref<boolean>(false);
const resendTimer = ref<number>(300); // 5 minutes in seconds
let interval: ReturnType<typeof setInterval> | null = null;

const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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

const startTimer = (): void => {
  resendTimer.value = 300;
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else {
      if (interval) clearInterval(interval);
    }
  }, 1000);
};

const handleVerify = async (code: string): Promise<void> => {
  loading.value = true;
  emit('verified', { otp: code, email: props.email, employeeNo: props.empNo })
  loading.value = false;
};

const handleResend = (): void => {
  emit('resend' , props.empNo, props.email );
  otpValue.value  = ''
  startTimer();
};

const handleNextStep = (v: string): void => {
 emit('switch', v);
};

onMounted(() => {
  startTimer();
  otpData.email = props.email
  otpData.employeeNo = props.empNo
});


onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>
