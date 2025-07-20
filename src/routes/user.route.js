import { Router } from "express"
import { changeCurrentPassword, 
        getCurrentUser, 
        loginUser, 
        logoutUser, 
        registerUser , updateAccountDetails} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT, logoutUser);
router.patch("/change-password", verifyJWT, changeCurrentPassword);
router.get("/current", verifyJWT, getCurrentUser);
router.patch("/update-account", verifyJWT, updateAccountDetails);


export default router;