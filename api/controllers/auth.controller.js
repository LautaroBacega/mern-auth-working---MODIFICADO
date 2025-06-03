import User from "../models/user.model.js"
import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js"
import jwt from "jsonwebtoken"
import transporter from "../config/nodemailer.js"
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js"

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body
  const hashedPassword = bcryptjs.hashSync(password, 10)
  const newUser = new User({ username, email, password: hashedPassword })
  try {
    await newUser.save()
    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
    })
  } catch (error) {
    next(error)
  }
}

export const signin = async (req, res, next) => {
  const { email, password } = req.body
  try {
    const validUser = await User.findOne({ email })
    if (!validUser) return next(errorHandler(404, "Usuario no encontrado"))
    const validPassword = bcryptjs.compareSync(password, validUser.password)
    if (!validPassword) return next(errorHandler(401, "Credenciales incorrectas"))
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET)
    const { password: hashedPassword, ...rest } = validUser._doc
    const expiryDate = new Date(Date.now() + 3600000) // 1 hour
    res.cookie("access_token", token, { httpOnly: true, expires: expiryDate }).status(200).json(rest)
  } catch (error) {
    next(error)
  }
}

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
      const { password: hashedPassword, ...rest } = user._doc
      const expiryDate = new Date(Date.now() + 3600000) // 1 hour
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json(rest)
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)
      const newUser = new User({
        username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-8),
        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.photo,
      })
      await newUser.save()
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)
      const { password: hashedPassword2, ...rest } = newUser._doc
      const expiryDate = new Date(Date.now() + 3600000) // 1 hour
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json(rest)
    }
  } catch (error) {
    next(error)
  }
}

export const signout = (req, res) => {
  res.clearCookie("access_token").status(200).json({
    success: true,
    message: "Sesión cerrada exitosamente",
  })
}

// Send verification OTP to user email
export const sendVerifyOtp = async (req, res, next) => {
  try {
    const userId = req.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado" })
    }

    if (user.isEmailVerified) {
      return res.json({ success: false, message: "Email ya verificado" })
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    // Set OTP and expiration (24 hours)
    user.verifyOtp = otp
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

    await user.save()

    // Send email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verificación de cuenta - Código OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{email}}", user.email).replace("{{otp}}", otp),
    }

    await transporter.sendMail(mailOptions)

    return res.json({
      success: true,
      message: "Código de verificación enviado a tu email",
    })
  } catch (error) {
    console.error("Error sending verification OTP:", error)
    return res.json({
      success: false,
      message: "Error al enviar el código de verificación",
    })
  }
}

// Verify email using OTP
export const verifyEmail = async (req, res, next) => {
  try {
    const { otp } = req.body
    const userId = req.userId

    if (!otp) {
      return res.json({ success: false, message: "Código OTP requerido" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado" })
    }

    // Check if OTP matches
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Código OTP inválido" })
    }

    // Check if OTP is expired
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "Código OTP expirado" })
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true
    user.verifyOtp = ""
    user.verifyOtpExpireAt = 0

    await user.save()

    return res.json({
      success: true,
      message: "Email verificado exitosamente",
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    return res.json({
      success: false,
      message: "Error al verificar el email",
    })
  }
}

// Check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    const userId = req.userId

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado" })
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
      },
    })
  } catch (error) {
    console.error("Error checking authentication:", error)
    return res.json({
      success: false,
      message: "Error al verificar autenticación",
    })
  }
}

// Send password reset OTP
export const sendResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.json({ success: false, message: "Email requerido" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado" })
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    // Set OTP and expiration (15 minutes)
    user.resetOtp = otp
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

    await user.save()

    // Send email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Restablecimiento de contraseña - Código OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{email}}", user.email).replace("{{otp}}", otp),
    }

    await transporter.sendMail(mailOptions)

    return res.json({
      success: true,
      message: "Código de restablecimiento enviado a tu email",
    })
  } catch (error) {
    console.error("Error sending reset OTP:", error)
    return res.json({
      success: false,
      message: "Error al enviar el código de restablecimiento",
    })
  }
}

// Reset user password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.json({
        success: false,
        message: "Email, código OTP y nueva contraseña son requeridos",
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado" })
    }

    // Check if OTP matches
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Código OTP inválido" })
    }

    // Check if OTP is expired
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "Código OTP expirado" })
    }

    // Hash new password
    const hashedPassword = bcryptjs.hashSync(newPassword, 10)

    // Update password and clear reset OTP
    user.password = hashedPassword
    user.resetOtp = ""
    user.resetOtpExpireAt = 0

    await user.save()

    return res.json({
      success: true,
      message: "Contraseña restablecida exitosamente",
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return res.json({
      success: false,
      message: "Error al restablecer la contraseña",
    })
  }
}
