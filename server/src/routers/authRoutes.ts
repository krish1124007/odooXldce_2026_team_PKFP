import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// Phase 2 Placeholder Endpoints
router.post("/register", (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: "Auth endpoints will be activated in Phase 2." });
});

router.post("/login", (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: "Auth endpoints will be activated in Phase 2." });
});

export default router;
