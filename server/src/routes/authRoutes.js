import express from "express";
import { registerController, loginController, profileController, logoutController, updateProfileController } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/authValidation.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", validateRegister, registerController);
router.post("/login", validateLogin, loginController);
router.post("/logout", isAuthenticated, logoutController);

router.get("/profile", isAuthenticated, profileController);

router.put("/profile", isAuthenticated, updateProfileController );


export default router;