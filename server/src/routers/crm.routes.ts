import { Router } from "express";
import { 
    createLead, 
    getLeads, 
    updateLeadStatus, 
    addLeadNote, 
    deleteLead 
} from "../controllers/crm.controller.js";

const router = Router();

router.post("/crm/leads", createLead);
router.get("/crm/leads", getLeads);
router.put("/crm/leads/:leadId/status", updateLeadStatus);
router.post("/crm/leads/:leadId/notes", addLeadNote);
router.delete("/crm/leads/:leadId", deleteLead);

export default router;
