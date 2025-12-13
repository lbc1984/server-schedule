<template>
  <v-container class="schedule-list-app">
    <v-card class="mb-4" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Thiết Bị</span>
        <v-btn @click="fetchDevices" :loading="isLoading" color="primary" prepend-icon="mdi-refresh">
          Làm mới
        </v-btn>
      </v-card-title>
    </v-card>

    <v-text-field v-model="searchQuery" label="MAC Address..." prepend-inner-icon="mdi-magnify" variant="outlined"
      clearable class="mb-6"></v-text-field>

    <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>
    <v-alert v-if="isLoading && !filteredDevices.length" type="info" class="mb-4">
      ⏳ Đang tải dữ liệu...
    </v-alert>

    <div v-if="filteredDevices.length > 0">
      <v-card v-for="device in filteredDevices" :key="device.mac" class="mb-6" elevation="3">

        <v-card-title class="d-flex justify-space-between align-center bg-grey-lighten-3">
          <div class="device-info">
            <strong>ID: {{ device.mac }}</strong>
            <span class="text-medium-emphasis"> (IP: {{ device.ip }})</span>
          </div>
          <div class="d-flex align-center ga-3">
            <v-chip :color="device.status === 'online' ? 'green' : 'red'" label class="font-weight-bold" size="small">
              {{ device.status === 'online' ? '🟢 ONLINE' : '🔴 OFFLINE' }}
            </v-chip>
            <v-btn color="success" prepend-icon="mdi-plus" @click="openAddModal(device.mac)">
              Thêm lịch
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <div v-if="getSchedulesArray(device).length > 0">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left">Giờ</th>
                  <th class="text-left">Lệnh</th>
                  <th class="text-left">Ngày</th>
                  <th class="text-left">Duy trì</th>
                  <th class="text-left">Trạng thái</th>
                  <th class="text-center">Sửa</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sch in getSchedulesArray(device)" :key="sch.id">
                  <td class="font-weight-bold">{{ sch.hour }}:{{ String(sch.minute).padStart(2, '0') }}</td>
                  <td>
                    <v-chip :color="sch.action === 'ON' ? 'cyan-darken-1' : 'orange-darken-1'" size="small" label>
                      {{ sch.action }}
                    </v-chip>
                  </td>
                  <td>{{ formatDays(sch.days) }}</td>
                  <td>{{ sch.duration > 0 ? sch.duration + 's' : '∞' }}</td>
                  <td>
                    <v-chip size="small" :color="isSentToday(sch.sentDate) ? 'light-green-darken-2' : 'grey'">
                      {{ isSentToday(sch.sentDate) ? '✅ Đã chạy' : '⏳ Chờ' }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-btn icon="mdi-pencil" size="small" variant="text" color="blue-grey"
                      @click="openEditModal(device.mac, sch)"></v-btn>
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

    <v-dialog v-model="showModal" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white">
          {{ isEditing ? '✏️ Sửa Lịch Hẹn' : '➕ Thêm Lịch Mới' }}
        </v-card-title>
        <v-card-subtitle class="mt-2">Thiết bị: {{ targetMac }}</v-card-subtitle>

        <v-card-text class="py-4">

          <v-row dense>
            <v-col cols="12">
              <label class="font-weight-bold">Thời gian (Giờ : Phút):</label>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="formState.hour" label="Giờ (HH)" type="number" min="0" max="23"
                variant="outlined" density="compact"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="formState.minute" label="Phút (MM)" type="number" min="0" max="59"
                variant="outlined" density="compact"></v-text-field>
            </v-col>
          </v-row>

          <v-select v-model="formState.action" label="Hành động" :items="['ON', 'OFF']" variant="outlined"
            density="compact" class="mt-2"></v-select>

          <v-text-field v-model.number="formState.duration" label="Thời gian duy trì (Giây, 0 = Vĩnh viễn)"
            type="number" min="0" variant="outlined" density="compact"></v-text-field>

          <v-label class="mb-2 font-weight-bold">Ngày lặp lại:</v-label>
          <v-chip-group v-model="formState.days" column multiple class="py-2">
            <v-chip v-for="day in dayOptions" :key="day.value" :value="day.value"
              :color="formState.days.includes(day.value) ? 'primary' : 'grey-lighten-1'" filter>
              {{ day.label }}
            </v-chip>
          </v-chip-group>
        </v-card-text>

        <v-card-actions class="d-flex justify-end">
          <v-btn color="grey" variant="text" @click="closeModal" :disabled="isSaving">Hủy</v-btn>
          <v-btn color="primary" @click="handleSave" :loading="isSaving">
            {{ isEditing ? 'Cập Nhật' : 'Tạo Mới' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const allDevices = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const searchQuery = ref('');

// --- STATE CHO MODAL ---
const showModal = ref(false);
const isEditing = ref(false); // Biến kiểm tra đang thêm hay sửa
const isSaving = ref(false);
const targetMac = ref('');
const editingId = ref(null);  // ID của lịch đang sửa

// Form dữ liệu (Dùng chung)
const formState = reactive({
  hour: 7,
  minute: 0,
  action: 'ON',
  duration: 0,
  days: [0, 1, 2, 3, 4, 5, 6]
});

const DAY_MAP = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' };
const dayOptions = [
  { value: 1, label: 'T2' }, { value: 2, label: 'T3' }, { value: 3, label: 'T4' },
  { value: 4, label: 'T5' }, { value: 5, label: 'T6' }, { value: 6, label: 'T7' },
  { value: 0, label: 'CN' }
];

// --- API FETCH ---
const fetchDevices = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await axios.get(`${BASE_URL}/api/devices`);
    allDevices.value = response.data;
  } catch (error) {
    errorMessage.value = "Lỗi: " + (error.response?.data?.error || error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDevices();
});

// --- LOGIC MODAL: ADD ---
const openAddModal = (mac) => {
  isEditing.value = false;
  editingId.value = null;
  targetMac.value = mac;

  // Reset form
  formState.hour = 7;
  formState.minute = 0;
  formState.action = 'ON';
  formState.duration = 0;
  formState.days = [0, 1, 2, 3, 4, 5, 6];

  showModal.value = true;
};

// --- LOGIC MODAL: EDIT ---
const openEditModal = (mac, schedule) => {
  isEditing.value = true;
  editingId.value = schedule.id;
  targetMac.value = mac;

  // Fill dữ liệu cũ vào form
  formState.hour = schedule.hour;
  formState.minute = schedule.minute;
  formState.action = schedule.action;
  formState.duration = schedule.duration || 0;
  formState.days = Array.isArray(schedule.days) ? [...schedule.days] : [];

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// --- XỬ LÝ LƯU (ADD HOẶC EDIT) ---
const handleSave = async () => {
  isSaving.value = true;
  try {
    const payload = {
      ...formState,
      days: formState.days.sort((a, b) => a - b),
      sentDate: null // Reset để server gửi lại
    };

    if (isEditing.value) {
      // === GỌI API UPDATE (PUT) ===
      await axios.put(`${BASE_URL}/api/schedule/${targetMac.value}/${editingId.value}`, payload);
      alert("✅ Cập nhật thành công!");
    } else {
      // === GỌI API CREATE (POST) ===
      await axios.post(`${BASE_URL}/api/schedule/${targetMac.value}`, payload);
      alert("✅ Thêm mới thành công!");
    }

    closeModal();
    await fetchDevices(); // Tải lại danh sách
  } catch (error) {
    alert("❌ Lỗi: " + error.message);
  } finally {
    isSaving.value = false;
  }
};

// --- HELPERS ---
const filteredDevices = computed(() => {
  if (!searchQuery.value) return allDevices.value;
  const query = searchQuery.value.toLowerCase();
  return allDevices.value.filter(d => d.mac.toLowerCase().includes(query));
});

const getSchedulesArray = (device) => {
  if (!device.schedules) return [];
  return Object.keys(device.schedules)
    .map(key => ({ ...device.schedules[key], id: key }))
    // Loại bỏ placeholder (-1) và các action không hợp lệ
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
  // So sánh ngày (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];
  return sentDateStr.split("T")[0] === today;
};
</script>

<style scoped>
/* Chỉ giữ lại style cho container chính và loại bỏ hầu hết CSS cũ */
.schedule-list-app {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}
</style>