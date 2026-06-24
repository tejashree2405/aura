import { Router, Response } from "express";
import crypto from "crypto";
import { authenticate } from "../middleware/auth";
import { requireRole, RoleRequest } from "../middleware/roles";

const router = Router();

router.post(
  "/image",
  authenticate,
  requireRole("ADMIN", "SALON"),
  async (req: RoleRequest, res: Response) => {
    try {
      const { image, folder } = req.body as { image?: string; folder?: string };
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return res.status(503).json({ error: "Image uploads are not configured" });
      }
      if (!image || !/^data:image\/(jpeg|jpg|png|webp);base64,/.test(image)) {
        return res.status(400).json({ error: "Only JPEG, PNG, or WebP images are allowed. PDFs and documents are not accepted." });
      }
      if (Buffer.byteLength(image, "utf8") > 8 * 1024 * 1024) {
        return res.status(413).json({ error: "Image must be smaller than 6 MB" });
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const uploadFolder = folder || "aura/uploads";
      const publicId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const sigStr = `folder=${uploadFolder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

      const form = new FormData();
      form.append("file", image);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("folder", uploadFolder);
      form.append("public_id", publicId);
      form.append("signature", signature);

      const upload = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form },
      );
      const result = (await upload.json()) as {
        secure_url?: string;
        error?: { message?: string };
      };
      if (!upload.ok || !result.secure_url) {
        return res.status(502).json({ error: result.error?.message || "Image upload failed" });
      }

      return res.json({ url: result.secure_url });
    } catch (error) {
      console.error("Upload image error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
