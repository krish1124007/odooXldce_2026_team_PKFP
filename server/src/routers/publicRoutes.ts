import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.get("/trips/:publicId", (req: Request, res: Response) => {
    res.status(501).json({ success: false, message: "Public trip sharing endpoints will be activated in Phase 5." });
});

export default router;
