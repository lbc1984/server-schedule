import "dotenv/config"
import cron from "node-cron"
import mqtt from "mqtt"
import admin from "firebase-admin"
import { createRequire } from "module"

// 1. Setup Firebase Admin
const require = createRequire(import.meta.url)
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mqtt-d8e66-default-rtdb.asia-southeast1.firebasedatabase.app"
})

const db = admin.database()

const mqttClient = mqtt.connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS
})

mqttClient.on("connect", () => console.log("✅ MQTT connected"))
mqttClient.on("error", err => console.error("❌ MQTT Error:", err))

let schedules = {}
const devicesRef = db.ref("devices")

devicesRef.on(
    "value",
    snapshot => {
        const deviceIds = Object.keys(snapshot.val() || {})
        console.log("Devices found:", deviceIds)

        deviceIds.forEach(deviceId => {
            if (!schedules[deviceId]) {
                schedules[deviceId] = []

                const schedRef = db.ref(`devices/${deviceId}/schedules`)

                schedRef.on("value", snap => {
                    const data = snap.val() || {}
                    schedules[deviceId] = Object.keys(data).map(id => ({ id, ...data[id] }))
                    console.log(`Updated schedules for ${deviceId}:`, schedules[deviceId])
                })

                console.log(`Listening for ${deviceId}...`)
            }
        })
    },
    error => {
        console.error("Firebase Read Error:", error)
    }
)

// 4. Cron Job
cron.schedule("*/10 * * * * *", async () => {
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    console.log("fsdfds")

    for (const deviceId in schedules) {
        schedules[deviceId].forEach(async sch => {
            const days = sch.days || [0, 1, 2, 3, 4, 5, 6]
            const sentDate = sch.sentDate || null

            if (
                now.getHours() === sch.hour &&
                now.getMinutes() === sch.minute &&
                (!sentDate || sentDate !== today) &&
                days.includes(now.getDay())
            ) {
                mqttClient.publish(`/esp/${deviceId}/cmd`, JSON.stringify({ action: sch.action }))
                console.log(`[${today} ${now.getHours()}:${now.getMinutes()}] Sent ${sch.action} to ${deviceId}`)

                try {
                    const sentRef = db.ref(`devices/${deviceId}/schedules/${sch.id}`)
                    await sentRef.update({ sentDate: today })
                } catch (e) {
                    console.error("Lỗi update firebase:", e)
                }
            }
        })
    }
})
