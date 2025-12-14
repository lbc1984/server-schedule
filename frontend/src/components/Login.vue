<template>
  <div class="login-page">
    <v-card elevation="10" rounded="xl" class="pa-8 login-card">
      <div class="text-center mb-6">
        <v-avatar size="72" class="mb-3" color="primary">
          <v-icon size="36">mdi-calendar-clock</v-icon>
        </v-avatar>

        <h2 class="font-weight-bold mb-1">
          Scheduler Admin
        </h2>

        <p class="text-medium-emphasis text-body-2">
          Đăng nhập để quản lý thiết bị & lịch hẹn
        </p>
      </div>

      <v-btn block height="48" color="red-darken-1" class="text-white" prepend-icon="mdi-google" :loading="loading"
        @click="loginWithGoogle">
        Đăng nhập bằng Google
      </v-btn>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase'

const router = useRouter()
const loading = ref(false)

const loginWithGoogle = async () => {
  loading.value = true
  try {
    await signInWithPopup(auth, provider)
    router.replace('/schedule')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f8;
}

.login-card {
  width: 100%;
  max-width: 380px;
}
</style>
