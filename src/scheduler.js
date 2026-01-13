import cron from "node-cron"
import db from "./firebase.js"
import mqttClient from "./mqtt.js"
import admin from "firebase-admin"
import sendTelegram from "./telegram.js"

let schedules = {}

export const startScheduler = async () => {
    console.log("⏳ Starting Scheduler & LWT Listener...")
    await sendTelegram("Rubicon's scheduler service started.")

    mqttClient.on("message", async (topic, message) => {
        const msgString = message.toString()
        const match = topic.match(/device\/(.+)\/status/)

        if (match) {
            const mac = match[1]
            const status = msgString // "online" or "offline"

            console.log(`📶 Update Status: ${mac} -> ${status}`)

            try {
                const updateData = {
                    status: status,
                    lastSeen: admin.database.ServerValue.TIMESTAMP
                }

                if (status === "offline") {
                    updateData.disconnectedAt = new Date().toISOString()
                }

                await db.ref(`devices/${mac}`).update(updateData)
            } catch (e) {
                console.error("Firebase Status Update Error:", e)
            }
        }
    })

    // --- 2. Schedule Data Sync ---
    const devicesRef = db.ref("devices")
    devicesRef.on("value", snapshot => {
        const devices = snapshot.val() || {}

        Object.keys(devices).forEach(deviceId => {
            const device = devices[deviceId]

            if (device.status === "offline") {
                delete schedules[deviceId]
                return
            }

            if (!schedules[deviceId]) {
                schedules[deviceId] = []

                const schedRef = db.ref(`devices/${deviceId}/schedules`)
                schedRef.on("value", snap => {
                    const data = snap.val() || {}
                    schedules[deviceId] = Object.keys(data).map(id => ({
                        id,
                        ...data[id]
                    }))
                })
            }
        })
    })

    // --- 3. Cron Job: Execute Schedules (Every 10s) ---
    cron.schedule("*/10 * * * * *", async () => {
        const now = new Date()
        const today = now.toISOString().split("T")[0]

        for (const deviceId in schedules) {
            schedules[deviceId].forEach(async sch => {
                const days = sch.days || [0, 1, 2, 3, 4, 5, 6]
                const sentDate = sch.sentDate || null

                if (
                    now.getHours() == sch.hour &&
                    now.getMinutes() == sch.minute &&
                    (!sentDate || sentDate != today) &&
                    days.includes(now.getDay())
                ) {
                    mqttClient.publish(`device/${deviceId}/cmd`, JSON.stringify({ action: sch.action, duration: sch.duration }))
                    await sendTelegram(`${deviceId}: Action: ${sch.action}. Duration: ${sch.duration}. Time: ${now.toISOString()}`)
                    console.log(`Đến giờ tưới: ${deviceId}: Action: ${sch.action}. Duration: ${sch.duration}. Time: ${now.toISOString()}`)

                    try {
                        await db.ref(`devices/${deviceId}/schedules/${sch.id}`).update({ sentDate: today })
                    } catch (e) {
                        console.error("Update Schedule Error:", e)
                    }
                }
            })
        }
    })
}
