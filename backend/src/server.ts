import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import authRoutes from "./routes/auth";
import aiRoutes from "./routes/ai";
import ordersRoutes from "./routes/orders";
import salonRoutes from "./routes/salon";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);
app.use("/", ordersRoutes);
app.use("/salon", salonRoutes);
app.use("/admin", adminRoutes);
app.use("/upload", uploadRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "Aûra API is online and serene" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong in our serene sanctuary." });
});

app.listen(PORT, () => {
  console.log(`[Aûra Backend] Server listening on port ${PORT}`);
});
