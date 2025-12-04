import "dotenv/config"; // Load env đầu tiên
import { startServer } from "./src/api.js";
import { startScheduler } from "./src/scheduler.js";

// Chạy API Server
startServer();

// Chạy Scheduler & MQTT Logic
startScheduler();