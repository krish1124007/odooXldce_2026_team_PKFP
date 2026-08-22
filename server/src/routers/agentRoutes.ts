import { Router } from "express";
import { processAgentChatHandler, confirmActionHandler } from "../controllers/agent.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

// Require authentication for all agent endpoints
router.use(verifyUser);

router.post("/chat", processAgentChatHandler);
router.post("/actions/confirm", confirmActionHandler);

export default router;
