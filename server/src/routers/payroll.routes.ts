import { Router } from "express";
import { 
    generatePayroll, 
    getPayrolls, 
    markPayrollAsPaid 
} from "../controllers/payroll.controller.js";

const router = Router();

router.post("/payroll/generate", generatePayroll);
router.get("/payroll", getPayrolls);
router.put("/payroll/:payrollId/pay", markPayrollAsPaid);

export default router;
