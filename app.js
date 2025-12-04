import "dotenv/config";
import { startServer } from "./src/api.js";
import { startScheduler } from "./src/scheduler.js";

const today = new Date().toISOString();
console.log("Server started on", today);

startServer();
startScheduler();