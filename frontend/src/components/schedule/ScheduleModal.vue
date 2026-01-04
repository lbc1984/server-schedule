<template>
    <v-dialog v-model="showModal" max-width="500">
        <v-card>
            <v-card-title class="bg-primary text-white">
                {{ props.isEditing ? '✏️ Sửa Lịch Hẹn' : '➕ Thêm Lịch Mới' }}
            </v-card-title>
            <v-card-subtitle class="mt-2">Thiết bị: {{ mac }}</v-card-subtitle>

            <v-card-text class="py-4">
                <v-row dense>
                    <v-col cols="12">
                        <label class="font-weight-bold">Thời gian (Giờ : Phút):</label>
                    </v-col>
                    <v-col cols="6">
                        <v-select v-model="localSchedule.hour" label="Giờ (HH)" :items="hours" variant="outlined"
                            density="compact" class="mt-2"></v-select>
                    </v-col>
                    <v-col cols="6">
                        <v-select v-model="localSchedule.minute" label="Phút (MM)" :items="minutes" variant="outlined"
                            density="compact" class="mt-2"></v-select>
                    </v-col>
                </v-row>

                <v-select v-model="localSchedule.action" label="Hành động" :items="['ON']" variant="outlined"
                    density="compact" class="mt-2"></v-select>

                <v-text-field v-model.number="localSchedule.duration" label="Thời gian duy trì (giây > 0)" type="number"
                    min="1" variant="outlined" density="compact" :rules="[v => v > 0]" error-color="red"></v-text-field>

                <v-label class="mb-2 font-weight-bold">Ngày lặp lại:</v-label>
                <v-chip-group v-model="localSchedule.days" column multiple class="py-2">
                    <v-chip v-for="day in dayOptions" :key="day.value" :value="day.value"
                        :color="localSchedule.days.includes(day.value) ? 'primary' : 'grey-lighten-1'" filter>
                        {{ day.label }}
                    </v-chip>
                </v-chip-group>
            </v-card-text>

            <v-card-actions class="d-flex justify-end">
                <v-btn color="grey" variant="text" @click="closeModal" :disabled="isSaving">Hủy</v-btn>
                <v-btn color="primary" @click="handleSave" :loading="isSaving" :disabled="!isDurationValid">
                    {{ props.isEditing ? 'Cập Nhật' : 'Tạo Mới' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { reactive, onMounted, computed, watch, ref } from 'vue';
import axios from 'axios';

const props = defineProps({
    isShow: Boolean,
    isEditing: Boolean,
    dataSchedule: Object,
    mac: String,
    scheduleId: String
})

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const isSaving = ref(false)
const minutes = []
const hours = []
const dayOptions = [
    { value: 1, label: 'T2' }, { value: 2, label: 'T3' }, { value: 3, label: 'T4' },
    { value: 4, label: 'T5' }, { value: 5, label: 'T6' }, { value: 6, label: 'T7' },
    { value: 0, label: 'CN' }
];
const emit = defineEmits(["update:isShow", "handleSave"])
const localSchedule = reactive({ ...props.dataSchedule })

onMounted(() => {
    for (let index = 0; index < 60; index++) {
        minutes.push(index)
    }

    for (let index = 0; index < 24; index++) {
        hours.push(index)
    }
})

const showModal = computed({
    get: () => props.isShow,
    set: (value) => emit("update:isShow", value)
})

watch(
    () => props.dataSchedule,
    (newVal) => {
        if (!newVal) return
        Object.assign(localSchedule, newVal)
    },
    { immediate: true, deep: true }
)

const closeModal = () => {
    emit('update:isShow', false)
    emit('handleSave')
}

const handleSave = async () => {
    isSaving.value = true;
    try {
        const payload = {
            ...localSchedule,
            days: localSchedule.days.sort((a, b) => a - b),
            sentDate: null
        };

        if (props.isEditing) {
            await axios.put(`${BASE_URL}/api/schedule/${props.mac}/${props.scheduleId}`, payload);
        } else {
            await axios.post(`${BASE_URL}/api/schedule/${props.mac}`, payload);
        }

        closeModal();
    } catch (error) {
        alert("❌ Lỗi: " + error.message);
    } finally {
        isSaving.value = false;
    }
};

const isDurationValid = computed(() => {
    return localSchedule.duration > 0;
});
</script>