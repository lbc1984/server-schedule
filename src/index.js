import "dotenv/config"; // Load env đầu tiên
import { startServer } from "./api.js";
import { startScheduler } from "./scheduler.js";

// Chạy API Server
startServer();

// Chạy Scheduler & MQTT Logic
startScheduler();