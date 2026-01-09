<template>
    <v-dialog v-model="isShow" max-width="500">
        <v-card>
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
                            {{ nameDevice }}
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
                <v-btn color="grey" variant="tonal" @click="closeModal" :disabled="isDeleting">Hủy</v-btn>
                <v-btn color="warning" variant="tonal" @click="handleDelete" :loading="isDeleting">
                    Delete
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
const DAY_MAP = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' };

const props = defineProps({
    nameDevice: String,
    dataSchedule: Object,
    isShow: Boolean,
    isDeleting: Boolean
})

const emit = defineEmits(["update:isShow", "update:isDeleting", "handleDelete"])

const isShow = computed({
    get: () => props.isShow,
    set: (value) => emit("update:isShow", value)
})

const isDeleting = computed({
    get: () => props.isDeleting,
    set: () => { emit("update:isDeleting") }
})

const closeModal = () => {
    emit('update:isShow', false)
}

const handleDelete = async () => {
    emit('update:isDeleting', true)
    emit("handleDelete")
}

const formatDays = (days) => {
    if (!Array.isArray(days) || days.length === 7) return 'Hàng ngày';
    if (days.length === 0) return 'Không lặp';


    return days.map(d => DAY_MAP[d]).join(', ');
};
</script>