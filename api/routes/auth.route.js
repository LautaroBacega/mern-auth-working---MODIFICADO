import express from "express"
import {
  signin,
  signup,
  google,
  signout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from "../controllers/auth.controller.js"
import userAuth from "../middleware/userAuth.js"
import { otpLimiter, resetPasswordLimiter, verifyEmailLimiter } from "../middleware/rateLimiter.js"

const router = express.Router()

// Authentication routes
router.post("/signup", signup)
router.post("/signin", signin)
router.post("/google", google)
router.get("/signout", signout)

// Email verification routes
router.post("/send-verify-otp", userAuth, otpLimiter, sendVerifyOtp)
router.post("/verify-email", userAuth, verifyEmailLimiter, verifyEmail)

// Authentication check
router.get("/is-auth", userAuth, isAuthenticated)

// Password reset routes
router.post("/send-reset-otp", otpLimiter, sendResetOtp)
router.post("/reset-password", resetPasswordLimiter, resetPassword)

export default router

