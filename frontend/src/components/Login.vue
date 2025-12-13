<template>
  <div>
    <button @click="loginWithGoogle">
      Đăng nhập bằng Google
    </button>
  </div>
</template>

<script>
import { auth } from "../firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

export default {
  methods: {
    async loginWithGoogle() {
      try {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        this.$router.push({ name: "ScheduleList" })

      } catch (error) {
        console.error(error)
        alert("Đăng nhập thất bại")
      }
    }
  }
}
</script>
