import express from "express";
import cors from "cors";
import db from "./firebase.js";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Sửa nhẹ: dùng || thay vì | để tránh lỗi port = 0
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================================
// 1. API CŨ (GIỮ NGUYÊN KHÔNG SỬA)
// ============================================================
app.post("/api/register", async (req, res) => {
  try {
    const { mac, ip } = req.body;

    if (!mac) return res.status(400).json({ error: "Thiếu MAC Address" });

    console.log(`📡 New Device: ${mac} (IP: ${ip})`);

    const deviceRef = db.ref(`devices/${mac}`);
    await deviceRef.update({
      connectedAt: new Date().toISOString(),
      status: "online",
      ip: ip || "unknown",
      lastSeen: admin.database.ServerValue.TIMESTAMP
    });

    const schedRef = db.ref(`devices/${mac}/schedules`);
    const snap = await schedRef.get();

    if (!snap.exists()) {
      const placeholderKey = schedRef.push().key;
      await schedRef.child(placeholderKey).set({
        action: "off",
        hour: -1,
        minute: -1,
        days: [0, 1, 2, 3, 4, 5, 6],
        duration: 0,
        sentDate: -1
      });
    }

    res.json({
      success: true,
      message: "Registered",
      config: {
        mqtt_host: process.env.MQTT_HOST,
        mqtt_port: parseInt(process.env.MQTT_PORT),
        mqtt_user: process.env.MQTT_USER,
        mqtt_pass: process.env.MQTT_PASS
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ============================================================
// 2. API MỚI: LẤY DANH SÁCH TOÀN BỘ DEVICES
// ============================================================
app.get("/api/devices", async (req, res) => {
  try {
    // 1. Lấy toàn bộ node 'devices'
    const snapshot = await db.ref("devices").once("value");
    const data = snapshot.val() || {};

    // 2. Chuyển đổi từ Object sang Array để Frontend dễ hiển thị
    // Từ: { "MAC_A": { ... }, "MAC_B": { ... } }
    // Sang: [ { mac: "MAC_A", ... }, { mac: "MAC_B", ... } ]
    const devicesList = Object.keys(data).map(key => {
      return {
        mac: key,         // Gán Key làm địa chỉ MAC
        ...data[key]      // Copy toàn bộ dữ liệu bên trong (ip, status, schedules...)
      };
    });

    res.json(devicesList);

  } catch (error) {
    console.error("Get Devices Error:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách thiết bị" });
  }
});

// ============================================================
// 3. API MỚI: THÊM LỊCH HẸN (SCHEDULE)
// ============================================================
app.post("/api/schedule/:mac", async (req, res) => {
  try {
    const { mac } = req.params;
    const scheduleData = req.body; // Dữ liệu từ Modal Vue gửi lên (hour, minute, action, ...)

    if (!mac || !scheduleData) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    console.log(`📅 Adding schedule for ${mac}:`, scheduleData);

    const schedRef = db.ref(`devices/${mac}/schedules`);

    // Bước 1: Thêm lịch hẹn mới vào Firebase (tự sinh Key ID)
    const newRef = schedRef.push();

    // Lưu dữ liệu vào key mới đó
    await newRef.set({
      ...scheduleData,
      // Đảm bảo các trường bắt buộc nếu thiếu
      sentDate: scheduleData.sentDate || null
    });

    // Bước 2: Dọn dẹp Placeholder (Lịch rỗng tạo lúc register)
    // Nếu thiết bị đã có lịch thật, ta xóa cái lịch "hour: -1" đi cho sạch
    const snapshot = await schedRef.once("value");
    snapshot.forEach((child) => {
      const val = child.val();
      // Kiểm tra điều kiện placeholder (giống logic ở api register)
      if (val.hour === -1 && val.minute === -1 && val.action === "off") {
        console.log(`🧹 Removing placeholder: ${child.key}`);
        child.ref.remove();
      }
    });

    res.json({
      success: true,
      message: "Thêm lịch thành công",
      id: newRef.key
    });

  } catch (error) {
    console.error("Add Schedule Error:", error);
    res.status(500).json({ error: "Lỗi Server khi thêm lịch" });
  }
});

// ============================================================
// 4. API MỚI: SỬA LỊCH HẸN (UPDATE)
// ============================================================
app.put("/api/schedule/:mac/:id", async (req, res) => {
  try {
    const { mac, id } = req.params;
    const scheduleData = req.body;

    if (!mac || !id || !scheduleData) {
      return res.status(400).json({ error: "Thiếu thông tin cập nhật" });
    }

    console.log(`📝 Updating schedule ${id} for ${mac}`);

    const schedRef = db.ref(`devices/${mac}/schedules/${id}`);

    // Kiểm tra xem lịch có tồn tại không
    const snap = await schedRef.get();
    if (!snap.exists()) {
      return res.status(404).json({ error: "Lịch hẹn không tìm thấy" });
    }

    // Cập nhật dữ liệu
    await schedRef.update({
      ...scheduleData,
      // Reset trạng thái đã gửi để server xử lý lại nếu cần
      sentDate: null
    });

    res.json({ success: true, message: "Cập nhật thành công" });

  } catch (error) {
    console.error("Update Schedule Error:", error);
    res.status(500).json({ error: "Lỗi Server khi cập nhật" });
  }
});

// ============================================================
// 3. CÁC API KHÁC
// ============================================================

app.get("/api", async (req, res) => {
  res.json({ message: "API is running" });
});

app.use(express.static(path.join(__dirname, "frontend")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

export const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 API Server node running on port ${PORT}`);
  });
};