import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRoutes from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import path from "path"
import cors from "cors"
import rateLimit from "express-rate-limit"

dotenv.config()

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((err) => {
    console.log(err)
  })

const __dirname = path.resolve()

const app = express()

// CORS configuration
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", process.env.CLIENT_URL].filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Demasiadas solicitudes. Intenta de nuevo en 15 minutos.",
  },
})

app.use(generalLimiter)

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())

// Serve static files
app.use(express.static(path.join(__dirname, "/client/dist")))

// API routes
app.use("/api/user", userRoutes)
app.use("/api/auth", authRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"))
})

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Error interno del servidor"
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
