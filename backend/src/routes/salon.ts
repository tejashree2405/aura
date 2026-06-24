import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../services/db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { requireRole, RoleRequest } from "../middleware/roles";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "aura-secret-key-change-in-prod";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// POST /salon/register
router.post("/register", async (req, res) => {
  try {
    const { salonName, ownerName, email, password, phone, address, city, description, services, timings } = req.body;
    if (!salonName || !ownerName || !email || !password || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    let slug = slugify(salonName);
    const slugExists = await prisma.salon.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: ownerName,
        email,
        passwordHash,
        phone,
        role: "SALON",
        salon: {
          create: {
            slug,
            name: salonName,
            ownerName,
            email,
            phone,
            address: address || "",
            city: city || "Bangalore",
            description: description || "",
            services: services || [],
            timings: timings || "10:00-21:00",
          },
        },
      },
      include: { salon: true },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      salon: user.salon,
    });
  } catch (error) {
    console.error("Salon register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /salon/profile
router.get(
  "/profile",
  authenticate,
  requireRole("SALON"),
  async (req: RoleRequest, res: Response) => {
    try {
      const salon = await prisma.salon.findUnique({ where: { userId: req.userId! } });
      if (!salon) return res.status(404).json({ error: "Salon profile not found" });
      return res.json(salon);
    } catch (error) {
      console.error("Fetch salon profile error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PUT /salon/profile
router.put(
  "/profile",
  authenticate,
  requireRole("SALON"),
  async (req: RoleRequest, res: Response) => {
    try {
      const salon = await prisma.salon.findUnique({ where: { userId: req.userId! } });
      if (!salon) return res.status(404).json({ error: "Salon not found" });

      const allowed = ["name", "description", "services", "address", "city", "fulfillmentAddress", "timings", "coverImage", "galleryImages", "phone", "website", "instagram", "startingPrice"];
      const data: Record<string, unknown> = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) {
          data[key] = req.body[key];
        }
      }
      if (data.startingPrice !== undefined) data.startingPrice = parseInt(String(data.startingPrice), 10) || 0;
      if (data.coverImage === "") data.coverImage = null;
      if (data.services && !Array.isArray(data.services)) data.services = [];
      if (data.galleryImages && !Array.isArray(data.galleryImages)) data.galleryImages = [];

      const updated = await prisma.salon.update({ where: { id: salon.id }, data });
      return res.json(updated);
    } catch (error) {
      console.error("Update salon profile error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /salon/appointments
router.get(
  "/appointments",
  authenticate,
  requireRole("SALON"),
  async (req: RoleRequest, res: Response) => {
    try {
      const salon = await prisma.salon.findUnique({ where: { userId: req.userId! } });
      if (!salon) return res.status(404).json({ error: "Salon not found" });

      const appointments = await prisma.appointment.findMany({
        where: { salonId: salon.slug },
        include: { user: { select: { name: true, email: true, phone: true } } },
        orderBy: { date: "desc" },
      });
      return res.json(appointments);
    } catch (error) {
      console.error("Fetch salon appointments error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PUT /salon/appointments/:id — confirm, reject, complete
router.put(
  "/appointments/:id",
  authenticate,
  requireRole("SALON"),
  async (req: RoleRequest, res: Response) => {
    try {
      const salon = await prisma.salon.findUnique({ where: { userId: req.userId! } });
      if (!salon) return res.status(404).json({ error: "Salon not found" });

      const appointment = await prisma.appointment.findFirst({
        where: { id: req.params.id, salonId: salon.slug },
      });
      if (!appointment) return res.status(404).json({ error: "Appointment not found" });

      const { status } = req.body;
      const allowed: Record<string, string[]> = {
        PENDING: ["CONFIRMED", "REJECTED"],
        CONFIRMED: ["COMPLETED", "CANCELLED"],
      };
      const current = appointment.status;
      if (!allowed[current]?.includes(status)) {
        return res.status(400).json({ error: `Cannot change status from ${current} to ${status}` });
      }

      const updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status },
      });
      return res.json(updated);
    } catch (error) {
      console.error("Update salon appointment error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /salon/slots?salonId=xxx&date=2026-06-24 — available time slots (public)
router.get("/slots", async (req, res) => {
  try {
    const { salonId, date } = req.query;
    if (!salonId || !date) {
      return res.status(400).json({ error: "salonId and date are required" });
    }
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);
    const booked = await prisma.appointment.findMany({
      where: {
        salonId: String(salonId),
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { time: true, startTime: true, endTime: true },
    });
    const bookedSlots = booked.map((a) => a.startTime || a.time);

    const allSlots: string[] = [];
    for (let h = 10; h < 21; h++) {
      allSlots.push(`${h.toString().padStart(2, "0")}:00`);
      allSlots.push(`${h.toString().padStart(2, "0")}:30`);
    }

    const available = allSlots.filter((s) => !bookedSlots.includes(s));
    return res.json({ date, salonId, available, booked: bookedSlots });
  } catch (error) {
    console.error("Fetch slots error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
