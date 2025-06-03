import rateLimit from "express-rate-limit"

// Rate limiter for OTP requests
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 OTP requests per windowMs
  message: {
    success: false,
    message: "Demasiadas solicitudes de OTP. Intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for password reset requests
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 password reset attempts per windowMs
  message: {
    success: false,
    message: "Demasiados intentos de restablecimiento de contraseña. Intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for email verification
export const verifyEmailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 verification attempts per windowMs
  message: {
    success: false,
    message: "Demasiados intentos de verificación. Intenta de nuevo en 5 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
