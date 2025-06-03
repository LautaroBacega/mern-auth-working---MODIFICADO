import express from "express"
import { test, updateUser, deleteUser, getUserData } from "../controllers/user.controller.js"
import { verifyToken } from "../utils/verifyUser.js"
import userAuth from "../middleware/userAuth.js"

const router = express.Router()

router.get("/", test)
router.get("/data", userAuth, getUserData)
router.post("/update/:id", verifyToken, updateUser)
router.delete("/delete/:id", verifyToken, deleteUser)

export default router
