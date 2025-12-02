import mqtt from "mqtt";
import "dotenv/config";

const mqttClient = mqtt.connect(process.env.MQTT_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
});

mqttClient.on("connect", () => console.log("✅ MQTT Connected"));
mqttClient.on("error", (err) => console.error("❌ MQTT Error:", err));

export default mqttClient;