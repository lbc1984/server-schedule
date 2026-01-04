<template>
    <v-dialog v-model="showModal" max-width="420">
        <v-card>
            <v-card-title class="text-h6">
                Claim thiết bị
            </v-card-title>

            <v-card-text>
                <v-text-field v-model="mac" label="Nhập key" clearable autofocus @input="mac = mac.toUpperCase()" />
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="close">Hủy</v-btn>
                <v-btn color="primary" @click="submit">
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

const emit = defineEmits(["update:isShow", "submit"])

const showModal = computed({
    get: () => props.isShow,
    set: (value) => emit("update:isShow", value)
})

const mac = ref("")

const submit = () => {
    emit("submit", mac.value)
    emit("update:isShow", false)
    mac.value = ""
}

const close = () => {
    emit("update:isShow", false)
}
</script>
