import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: "City discovery endpoints will be activated in Phase 3." });
});

export default router;
