import { Router } from "express";
import { 
    getUserProfile, 
    updateUserProfile, 
    updateUserPreferences, 
    deleteUserAccount 
} from "../controllers/user.profile.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyUser);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/preferences", updateUserPreferences);
router.delete("/account", deleteUserAccount);

export default router;

