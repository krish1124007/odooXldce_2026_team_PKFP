import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.post("/chat", (req: Request, res: Response) => {
    res.status(501).json({ 
        success: false, 
        message: "GlobeTrotter Groq Agentic AI layer will be activated in Phase 6." 
    });
});

export default router;
