<template>
    <v-dialog v-model="showModal" max-width="500">
        <v-card class="rounded-xl">
            <v-card-title class="bg-primary text-white">
                Xóa thời gian
            </v-card-title>
            <v-card-text class="py-4">
                <v-alert type="warning" variant="tonal" border="start" class="mb-4">
                    ⚠️ Bạn sắp <strong>xóa lịch hẹn</strong> này.
                    Hành động này <strong>không thể hoàn tác</strong>.
                </v-alert>

                <v-list density="compact">
                    <v-list-item>
                        <v-list-item-title>
                            <strong>Thiết bị:</strong>
                            {{ mac }}
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-title>
                            <strong>Thời gian:</strong>
                            {{ dataSchedule.hour }}:{{ String(dataSchedule.minute).padStart(2, '0') }}
                        </v-list-item-title>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-title>
                            <strong>Hành động:</strong> {{ dataSchedule.action }}
                        </v-list-item-title>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-title>
                            <strong>Duy trì:</strong>
                            {{ dataSchedule.duration > 0 ? dataSchedule.duration + ' giây' : 'Vĩnh viễn' }}
                        </v-list-item-title>
                    </v-list-item>

                    <v-list-item>
                        <v-list-item-title>
                            <strong>Ngày lặp:</strong>
                            {{ formatDays(dataSchedule.days) }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>

                <v-divider class="my-4"></v-divider>

                <div class="text-center font-weight-bold text-red">
                    ❌ Bạn có chắc chắn muốn xóa lịch này không?
                </div>
            </v-card-text>

            <v-card-actions class="d-flex justify-end">
                <v-btn color="grey" variant="tonal" @click="closeModal" :disabled="isSaving">Hủy</v-btn>
                <v-btn color="warning" variant="tonal" @click="handleDelete" :loading="isSaving">
                    Delete
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const props = defineProps({
    mac: String,
    dataSchedule: Object,
    isShow: Boolean,
    scheduleId: String
})

const isSaving = ref(false)
const emit = defineEmits(["update:isShow", "handleDelete"])

const showModal = computed({
    get: () => props.isShow,
    set: (value) => emit("update:isShow", value)
})

const closeModal = () => {
    emit('update:isShow', false)
    emit("handleDelete")
}

const handleDelete = async () => {
    isSaving.value = true
    await axios.delete(`${BASE_URL}/api/schedule/${props.mac}/${props.scheduleId}`);
    closeModal();
}

const formatDays = (days) => {
    if (!Array.isArray(days) || days.length === 7) return 'Hàng ngày';
    if (days.length === 0) return 'Không lặp';
    return days.map(d => DAY_MAP[d]).join(', ');
};
</script>