<template>
    <v-container>
        <v-col cols="12" class="mb-4 ga-2 d-flex justify-end">
            <v-btn @click="fetchDevices" :loading="isLoading" color="primary" prepend-icon="mdi-refresh">
                Làm mới
            </v-btn>
            <v-btn @click="openClaimModal" :loading="isLoading" color="primary" prepend-icon="mdi-plus">
                Thêm mới
            </v-btn>
        </v-col>
        <v-col cols="12">
            <v-text-field v-model="searchQuery" label="Nhập tên..." prepend-inner-icon="mdi-magnify" variant="outlined"
                clearable density="compact"></v-text-field>
        </v-col>

        <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>
        <v-alert v-if="isLoading && !filteredDevices.length" type="info" class="mb-4">
            ⏳ Đang tải dữ liệu...
        </v-alert>

        <div v-if="filteredDevices.length > 0">
            <v-card v-for="device in filteredDevices" :key="device.mac" class="mb-6" elevation="3">
                <v-card-title class="bg-grey-lighten-3">
                    <v-row>
                        <v-col cols="12" md="6">
                            <div class="d-flex align-center">
                                <span v-if="!device.isEditing">
                                    <b>Name:</b> {{ device.name }}
                                </span>

                                <v-text-field v-else v-model="device.name" label="Name" density="compact"
                                    variant="outlined" hide-details style="max-width: 400px" />

                                <v-btn icon size="x-small" variant="text" @click="toggleEdit(device)">
                                    <v-icon>{{ device.isEditing ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
                                </v-btn>
                            </div>
                            <div>
                                <b>IP:</b> {{ device.ip }}
                                <v-chip :color="device.status === 'online' ? 'green' : 'red'" label size="small"
                                    class="font-weight-bold ml-2">
                                    {{ device.status === 'online' ? '🟢 ON' : '🔴 OFF' }}
                                </v-chip>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="d-flex ga-2 align-center justify-end justify-sm-end">
                                <v-text-field label="Nhập duration" v-model="device.now" variant="outlined"
                                    type="number" density="compact" hide-details class="flex-grow-1 duration-input"
                                    :disabled="device.status != 'online'" :rules="[v => v > 0]" error-color="red" />

                                <v-btn color="primary" @click="actionNow(device.mac, device.now)" class="flex-shrink-0"
                                    :disabled="device.status != 'online' || device.now <= 0 || device.now == null">
                                    Chạy
                                </v-btn>
                                <v-btn color="warning" @click="actionNow(device.mac, 0, 'OFF')" class="flex-shrink-0"
                                    :disabled="device.status != 'online'">
                                    Dừng
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <v-row class="mb-4 mt-4">
                        <v-col cols="12" class="d-flex justify-end ga-2">
                            <v-btn color="success" prepend-icon="mdi-plus" size="small"
                                @click="openAddModal(device.mac)">
                                Thêm lịch
                            </v-btn>
                        </v-col>
                    </v-row>

                    <div v-if="getSchedulesArray(device).length > 0">
                        <v-table density="comfortable">
                            <thead>
                                <tr>
                                    <th class="text-left">Time</th>
                                    <th class="text-left">Action</th>
                                    <th class="text-left">Repeat</th>
                                    <th class="text-left">duration</th>
                                    <th class="text-left">Status</th>
                                    <th class="text-center">Edit</th>
                                    <th class="text-center">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="sch in getSchedulesArray(device)" :key="sch.id">
                                    <td class="font-weight-bold">{{ sch.hour }}:{{ String(sch.minute).padStart(2, '0')
                                    }}</td>
                                    <td>
                                        <v-chip :color="sch.action === 'ON' ? 'cyan-darken-1' : 'orange-darken-1'"
                                            size="small" label>
                                            {{ sch.action }}
                                        </v-chip>
                                    </td>
                                    <td>{{ formatDays(sch.days) }}</td>
                                    <td>{{ sch.duration > 0 ? sch.duration + 's' : '∞' }}</td>
                                    <td>
                                        <v-chip size="small"
                                            :color="isSentToday(sch.sentDate) ? 'light-green-darken-2' : 'grey'">
                                            {{ isSentToday(sch.sentDate) ? '✅ Đã chạy' : '⏳ Chờ' }}
                                        </v-chip>
                                    </td>
                                    <td class="text-center">
                                        <v-btn icon="mdi-pencil" size="small" variant="text" color="blue-grey"
                                            @click="openEditModal(device.mac, sch)"></v-btn>
                                    </td>
                                    <td class="text-center">
                                        <v-btn icon="mdi-delete-empty" size="small" variant="text" color="blue-grey"
                                            @click="openDeleteModal(device.name, sch)"></v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </div>
                    <v-alert v-else type="warning" variant="tonal" class="mt-4">
                        🚫 Chưa có lịch hẹn nào.
                    </v-alert>
                </v-card-text>
            </v-card>
        </div>

        <v-alert v-else-if="!isLoading" type="warning" class="mt-4">
            Không tìm thấy thiết bị nào.
        </v-alert>

        <schedule-modal v-model:isShow="showModal" v-model:isSaving="isSaving" :isEditing="isEditing"
            :dataSchedule="formState" :nameDevice="nameDevice" @handleSave="handleSave" />

        <delete-modal v-model:isShow="showModalDelete" v-model:isDeleting="isDeleting" :dataSchedule="formState"
            :nameDevice="nameDevice" @handleDelete="handleDelete" />

        <claim-modal v-model:isShow="showClaimModal" @hanldeClaim="hanldeClaim" />
    </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import ScheduleModal from './schedule/Modal/Schedule.vue';
import DeleteModal from './schedule/Modal/Delete.vue';
import ClaimModal from './schedule/Modal/Claim.vue';
import { getDevices, addSchedule, editSchedule, deleteSchedule, claimDevice } from "../api"
import { auth } from '../firebase';
import route from '../router/index'

const allDevices = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const searchQuery = ref('');

// --- STATE CHO MODAL ---
const showModal = ref(false);
const showModalDelete = ref(false);
const showClaimModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false)
const isDeleting = ref(false)
const targetMac = ref('');
const nameDevice = ref('')
const scheduleId = ref('');

const formState = reactive({
    hour: 7,
    minute: 0,
    action: 'ON',
    duration: 5,
    days: [0, 1, 2, 3, 4, 5, 6]
});

const DAY_MAP = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' };

// --- API FETCH ---
const fetchDevices = async () => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
        const response = await getDevices()
        allDevices.value = response.data;
    } catch (error) {
        if (error.response?.status === 403) {
            alert("Tài khoản không có quyền truy cập")
            await auth.signOut()
            route.replace('/login')
        } else {
            console.error(error)
        }
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchDevices();
});

const openAddModal = (mac) => {
    isEditing.value = false;
    scheduleId.value = null;
    targetMac.value = mac;

    formState.hour = 7;
    formState.minute = 0;
    formState.action = 'ON';
    formState.duration = 5;
    formState.days = [0, 1, 2, 3, 4, 5, 6];

    showModal.value = true;
};

const openEditModal = (mac, schedule) => {
    isEditing.value = true;
    scheduleId.value = schedule.id;
    targetMac.value = mac;

    formState.hour = schedule.hour;
    formState.minute = schedule.minute;
    formState.action = schedule.action;
    formState.duration = schedule.duration || 5;
    formState.days = Array.isArray(schedule.days) ? [...schedule.days] : [];

    showModal.value = true;
};

const openDeleteModal = (name, schedule) => {
    nameDevice.value = name
    showModalDelete.value = true;
    scheduleId.value = schedule.id;
    formState.hour = schedule.hour;
    formState.minute = schedule.minute;
    formState.action = schedule.action;
    formState.duration = schedule.duration;
    formState.days = Array.isArray(schedule.days) ? [...schedule.days] : [];
}

const openClaimModal = () => {
    showClaimModal.value = true
}

const hanldeClaim = async (mac) => {
    const result = await claimDevice(mac)
    await fetchDevices()

    console.log(result);

}

const handleSave = async (payload) => {
    isSaving.value = true;

    try {
        if (isEditing.value) {
            await editSchedule(payload, targetMac.value, scheduleId.value)
        } else {
            await addSchedule(payload, targetMac.value)
        }
    } catch (error) {
        alert("❌ Lỗi: " + error.message);
    } finally {
        isSaving.value = false;
        showModal.value = false;
        fetchDevices()
    }
};

const handleDelete = async () => {
    isDeleting.value = true
    await deleteSchedule(targetMac.value, scheduleId.value)
    isDeleting.value = false
    showModalDelete.value = false

    fetchDevices()
}

const filteredDevices = computed(() => {
    if (!searchQuery.value) return allDevices.value;
    const query = searchQuery.value.toLowerCase();
    return allDevices.value.filter(d => d.name.toLowerCase().includes(query));
});

const getSchedulesArray = (device) => {
    if (!device.schedules) return [];
    return Object.keys(device.schedules)
        .map(key => ({ ...device.schedules[key], id: key }))
        .filter(sch => sch.action !== 'NONE' && sch.hour !== -1)
        .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
};

const formatDays = (days) => {
    if (!Array.isArray(days) || days.length === 7) return 'Hàng ngày';
    if (days.length === 0) return 'Không lặp';
    return days.map(d => DAY_MAP[d]).join(', ');
};

const isSentToday = (sentDateStr) => {
    if (!sentDateStr) return false;

    const today = new Date().toISOString().split("T")[0];
    return sentDateStr.split("T")[0] === today;
};

const actionNow = async (mac, duration, action = "ON") => {
    await API.post('/api/action', { mac: mac, duration: duration, action: action })
};

const toggleEdit = async (device) => {
    if (device.isEditing) {
        if (!device.name?.trim()) {
            device.isEditing = false
            return
        }

        try {
            const payload = {
                name: device.name
            }
            await API.put(`/api/name/${device.mac}`, payload);
        } catch (err) {
            console.error("❌ Save failed", err)
            return
        }
    }

    device.isEditing = !device.isEditing
}
</script>

<style scoped>
.schedule-list-app {
    max-width: 900px;
    margin: 20px auto;
    padding: 20px;
}

.mobile-full {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0px;
}

@media (min-width: 960px) {
    .duration-input {
        max-width: 180px;
    }
}
</style>