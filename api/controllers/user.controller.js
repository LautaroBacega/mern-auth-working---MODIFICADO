import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import bcryptjs from "bcryptjs"

export const test = (req, res) => {
  res.json({
    message: "API is working!",
  })
}

// Get user data
export const getUserData = async (req, res, next) => {
  try {
    const userId = req.userId

    const user = await User.findById(userId).select("-password")

    if (!user) {
      return res.json({ success: false, message: "Usuario no encontrado" })
    }

    res.json({
      success: true,
      userData: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error getting user data:", error)
    res.json({ success: false, message: "Error al obtener datos del usuario" })
  }
}

// Update user
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "Solo puedes actualizar tu propia cuenta"))
  }
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10)
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      { new: true },
    )
    const { password, ...rest } = updatedUser._doc
    res.status(200).json(rest)
  } catch (error) {
    next(error)
  }
}

// Delete user
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "Solo puedes eliminar tu propia cuenta"))
  }
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    next(error)
  }
}
