import express from "express";
import cors from "cors";
import db from "./firebase.js";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import mqttClient from "./mqtt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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
    const snapshot = await db.ref("devices").once("value");
    const data = snapshot.val() || {};

    const devicesList = Object.keys(data).map(key => {
      return {
        mac: key,
        ...data[key]
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
    const scheduleData = req.body;

    if (!mac || !scheduleData) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    console.log(`📅 Adding schedule for ${mac}:`, scheduleData);

    const schedRef = db.ref(`devices/${mac}/schedules`);

    const newRef = schedRef.push();

    await newRef.set({
      ...scheduleData,
      sentDate: scheduleData.sentDate || null
    });

    const snapshot = await schedRef.once("value");
    snapshot.forEach((child) => {
      const val = child.val();
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

    const snap = await schedRef.get();
    if (!snap.exists()) {
      return res.status(404).json({ error: "Lịch hẹn không tìm thấy" });
    }

    await schedRef.update({
      ...scheduleData,
      sentDate: null
    });

    res.json({ success: true, message: "Cập nhật thành công" });

  } catch (error) {
    console.error("Update Schedule Error:", error);
    res.status(500).json({ error: "Lỗi Server khi cập nhật" });
  }
});

// ============================================================
// 5. API MỚI: xủ lý ngay LỊCH HẸN
// ============================================================
app.post("/api/action", async (req, res) => {
  try {
    const { mac, action, duration } = req.body;

    mqttClient.publish(`/device/${mac}/cmd`, JSON.stringify({ action: action, duration: duration }));
    console.log(`[Sent] ${action} to ${mac}`);
    return res.status(200).json({ success: true, message: "Action ngay đã được gửi" });
  }
  catch (error) {
    console.error("Add Schedule Error:", error);
    res.status(500).json({ error: "Lỗi Server khi action ngay" });
  }
});

// ============================================================
// 3. CÁC API KHÁC
// ============================================================

app.get("/check", async (req, res) => {
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