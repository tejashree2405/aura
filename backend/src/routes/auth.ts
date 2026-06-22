import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../services/db";
import { authenticate, AuthRequest } from "../middleware/auth";
import crypto from "crypto";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "aura-secret-key-change-in-prod";

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Missing required fields (name, email, password)" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "A member with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and automatically initialize an empty beauty profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        beautyProfile: {
          create: {}, // Starts empty
        },
      },
      include: {
        beautyProfile: true,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /auth/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { beautyProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.profileImage,
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /auth/me
router.patch("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone, avatarUrl } = req.body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (avatarUrl !== undefined) dataToUpdate.profileImage = avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatarUrl: updatedUser.profileImage,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/profile-image",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { image } = req.body as { image?: string };
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return res
          .status(503)
          .json({ error: "Profile image uploads are not configured" });
      }
      if (!image || !/^data:image\/(jpeg|png|webp);base64,/.test(image)) {
        return res
          .status(400)
          .json({ error: "Choose a JPEG, PNG, or WebP image" });
      }
      if (Buffer.byteLength(image, "utf8") > 8 * 1024 * 1024) {
        return res
          .status(413)
          .json({ error: "Profile image must be smaller than 6 MB" });
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "aura/profile-images";
      const publicId = userId;
      const signature = crypto
        .createHash("sha1")
        .update(
          `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`,
        )
        .digest("hex");
      const form = new FormData();
      form.append("file", image);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("folder", folder);
      form.append("public_id", publicId);
      form.append("overwrite", "true");
      form.append("signature", signature);

      const upload = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: form,
        },
      );
      const result = (await upload.json()) as {
        secure_url?: string;
        error?: { message?: string };
      };
      if (!upload.ok || !result.secure_url) {
        return res
          .status(502)
          .json({ error: result.error?.message || "Image upload failed" });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { profileImage: result.secure_url },
      });
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.profileImage,
      });
    } catch (error) {
      console.error("Profile image upload error:", error);
      return res.status(500).json({ error: "Could not upload profile image" });
    }
  },
);

router.post("/logout", (req, res) => {
  res.clearCookie("token");

  return res.json({
    success: true,
  });
});

export default router;
