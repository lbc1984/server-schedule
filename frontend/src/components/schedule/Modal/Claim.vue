<template>
  <v-dialog v-model="showModal" max-width="420">
    <v-card>
      <v-card-title class="d-flex align-center gap-2 text-h6 bg-primary text-white">
        <v-icon color="primary">mdi-link-variant</v-icon>
        Claim thiết bị
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-text-field
          v-model="mac"
          label="Key / MAC thiết bị"
          placeholder="VD: A1:B2:C3:D4:E5:F6"
          variant="outlined"
          clearable
          autofocus
          density="comfortable"
          prepend-inner-icon="mdi-key"
          counter
          maxlength="17"
          @input="mac = mac.toUpperCase()"
        />

        <div class="text-caption text-grey">
          Nhập key được hiển thị trên thiết bị hoặc QR code
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="close">
          Hủy
        </v-btn>

        <v-btn
          color="primary"
          :disabled="!mac"
          @click="hanldeClaim"
        >
          <v-icon start>mdi-check</v-icon>
          Xác nhận
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue"

const props = defineProps({
  isShow: Boolean
})

const emit = defineEmits(["update:isShow", "hanldeClaim"])

const showModal = computed({
  get: () => props.isShow,
  set: (value) => emit("update:isShow", value)
})

const mac = ref("")

watch(() => props.isShow, (val) => {
  if (val) mac.value = ""
})

const hanldeClaim = () => {
  if (!mac.value) return
  emit("hanldeClaim", mac.value.trim())
  emit("update:isShow", false)
}

const close = () => {
  emit("update:isShow", false)
}
</script>
