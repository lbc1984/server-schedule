import "dotenv/config";
import { startServer } from "./src/api.js";
import { startScheduler } from "./src/scheduler.js";

startServer();
startScheduler();