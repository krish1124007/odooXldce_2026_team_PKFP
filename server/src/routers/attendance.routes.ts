import { Router } from "express";
import { 
    clockIn, 
    clockOut, 
    getAttendanceLogs, 
    applyLeave, 
    updateLeaveStatus, 
    getLeaves 
} from "../controllers/attendance.controller.js";

const router = Router();

router.post("/attendance/clock-in", clockIn);
router.post("/attendance/clock-out", clockOut);
router.get("/attendance/logs", getAttendanceLogs);

router.post("/leaves/apply", applyLeave);
router.get("/leaves", getLeaves);
router.put("/leaves/:leaveId/status", updateLeaveStatus);

export default router;
