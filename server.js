// server.js
const cron = require("node-cron");
const mqtt = require("mqtt");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, update } = require("firebase/database");

// Firebase setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// MQTT setup
const mqttClient = mqtt.connect("mqtt://YOUR_MQTT_BROKER", {
  username: "YOUR_USERNAME",
  password: "YOUR_PASSWORD",
});

mqttClient.on("connect", () => console.log("MQTT connected"));

// Global cache for schedules
let schedules = {};

// Listen for devices node to detect new devices
const devicesRef = ref(db, "devices");
onValue(devicesRef, (snapshot) => {
  const deviceIds = Object.keys(snapshot.val() || {});
  deviceIds.forEach((deviceId) => {
    if (!schedules[deviceId]) {
      schedules[deviceId] = [];

      const schedRef = ref(db, `devices/${deviceId}/schedules`);
      onValue(schedRef, (snap) => {
        const data = snap.val() || {};
        schedules[deviceId] = Object.keys(data).map(id => ({ id, ...data[id] }));
        console.log(`Schedules updated for ${deviceId}`, schedules[deviceId]);
      });

      console.log(`Started listening for schedules of ${deviceId}`);
    }
  });
});

// Cron job every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  for (const deviceId in schedules) {
    schedules[deviceId].forEach(async (sch) => {
      const days = sch.days || [0,1,2,3,4,5,6];
      const sentDate = sch.sentDate || null;

      if (
        now.getHours() === sch.hour &&
        now.getMinutes() === sch.minute &&
        (!sentDate || sentDate !== today) &&
        days.includes(now.getDay())
      ) {
        mqttClient.publish(`/esp/${deviceId}/cmd`, JSON.stringify({ action: sch.action }));
        console.log(`[${today} ${now.getHours()}:${now.getMinutes()}] Sent ${sch.action} to ${deviceId}`);

        const sentRef = ref(db, `devices/${deviceId}/schedules/${sch.id}`);
        await update(sentRef, { sentDate: today });
      }
    });
  }
});
