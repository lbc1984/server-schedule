import mqtt from "mqtt";
import "dotenv/config";

const mqttClient = mqtt.connect({
	host: process.env.MQTT_HOST,
	port: parseInt(process.env.MQTT_PORT),
	username: process.env.MQTT_USER,
	password: process.env.MQTT_PASS,
	protocol: "mqtts"
});

mqttClient.on("connect", () =>
	console.log("✅ MQTT Connected"),
	mqttClient.subscribe("device/+/status")
);
mqttClient.on("error", (err) => console.error("❌ MQTT Error:", err));

export default mqttClient;