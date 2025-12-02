import express from "express";
import cors from "cors";
import db from "./firebase.js";
import admin from "firebase-admin";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

    // Tạo node schedules rỗng nếu chưa có
    const schedRef = db.ref(`devices/${mac}/schedules`);
    const snap = await schedRef.get();
    const placeholderKey = schedRef.push().key;

    if (!snap.exists()) {
       await schedRef.child(placeholderKey).set({
           action: "off",
           hour: -1,
           minute: -1,
           days: [0,1,2,3,4,5,6],
           sentDate: ""
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

export const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running at http://localhost:${PORT}`);
  });
};