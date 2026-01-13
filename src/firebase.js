import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		databaseURL: "https://mqtt-d8e66-default-rtdb.asia-southeast1.firebasedatabase.app"
	});
}

const db = admin.database();

export default db;