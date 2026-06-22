import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

import authRoutes from "./routes/auth";
import aiRoutes from "./routes/ai";
import ordersRoutes from "./routes/orders";
const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);
app.use("/", ordersRoutes);

app.use(express.json({ limit: "10mb" }));

// Route handlers
app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);
app.use("/", ordersRoutes); // Handles /orders and /appointments

// Root health check
app.get("/health", (req, res) => {
  res.json({ status: "Aûra API is online and serene" });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong in our serene sanctuary." });
});

app.listen(PORT, () => {
  console.log(`[Aûra Backend] Server listening on port ${PORT}`);
});
