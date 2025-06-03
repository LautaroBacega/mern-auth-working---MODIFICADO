import jwt from "jsonwebtoken"

const userAuth = async (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) {
    return res.status(401).json({ success: false, message: "No autorizado. Inicia sesión de nuevo" })
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

    if (tokenDecode.id) {
      req.userId = tokenDecode.id
    } else {
      return res.json({ success: false, message: "No autorizado. Inicia sesión de nuevo" })
    }

    next()
  } catch (error) {
    res.json({ success: false, message: "Token inválido" })
  }
}

export default userAuth
