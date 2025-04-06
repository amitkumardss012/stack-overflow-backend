import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

// Importing Routes
import { errorMiddleware } from "./api/middlewares";
import { answerRoutes, bookmarkRoutes, questionRoutes, userRoutes } from "./api/routes";
import { ENV } from "./config";


// All the Instances
const app = express()

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cookieParser()); 
app.use(morgan("dev"));
app.use(
    cors({
      origin: [ENV.FRONTEND_URL as string, ENV.FRONTEND_URL1 as string],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    })
  );

app.get("/", (req, res) => {
    res.send("Hello world")
})
app.get("/health", (req, res) => {
    res.json({
      message: "Healthy"
    })
})

// All the Routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/question", questionRoutes)
app.use("/api/v1/answer", answerRoutes)
app.use("/api/v1/bookmark", bookmarkRoutes)

app.use(errorMiddleware)

app.all("*", (req, res) => {
  res.status(404).json({
    message: "route not found"
  })
})

export default app;