import { Router, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../services/db";
import { authenticate, AuthRequest } from "../middleware/auth";

function prismaErrorResponse(error: unknown, res: Response, context: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`${context} [${error.code}]:`, error.message);
    switch (error.code) {
      case "P2002":
        return res.status(409).json({ error: "Duplicate entry" });
      case "P2003":
        return res.status(400).json({ error: "Referenced record does not exist" });
      case "P2025":
        return res.status(404).json({ error: "Record not found" });
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error(`${context} [validation]:`, error.message);
    return res.status(400).json({ error: "Invalid request data" });
  }
  console.error(`${context}:`, error);
  return res.status(500).json({ error: "Internal server error" });
}

const router = Router();

// ==========================================
// Orders Endpoints
// ==========================================

// GET /orders
router.get("/orders", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /orders
router.post(
  "/orders",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { items, total, paymentMethod } = req.body;

      if (!items || !total) {
        return res
          .status(400)
          .json({ error: "Missing items or total for order" });
      }

      const order = await prisma.order.create({
        data: {
          userId,
          total: parseFloat(total),
          paymentMethod,

          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      return res.status(201).json(order);
    } catch (error) {
      console.error("Create order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ==========================================
// Addresses Endpoints
// ==========================================

router.get("/addresses", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });
    return res.json(addresses);
  } catch (error) {
    return prismaErrorResponse(error, res, "Fetch addresses error");
  }
});

router.post("/addresses", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { label, fullName, phone, line1, line2, landmark, city, state, pincode } = req.body;
    if (!line1 || !city || !state || !pincode) {
      return res.status(400).json({ error: "Missing required address fields" });
    }
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: "Pincode must be exactly 6 digits" });
    }
    const address = await prisma.address.create({
      data: {
        userId: req.userId!,
        label: label || "Home",
        fullName: fullName || "",
        phone: phone || "",
        line1,
        line2: line2 || null,
        landmark: landmark || null,
        city,
        state,
        pincode,
      },
    });
    return res.status(201).json(address);
  } catch (error) {
    return prismaErrorResponse(error, res, "Create address error");
  }
});

router.put("/addresses/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: "Address not found" });
    if (req.body.pincode && !/^\d{6}$/.test(req.body.pincode)) {
      return res.status(400).json({ error: "Pincode must be exactly 6 digits" });
    }
    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json(address);
  } catch (error) {
    return prismaErrorResponse(error, res, "Update address error");
  }
});

router.delete("/addresses/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!existing) return res.status(404).json({ error: "Address not found" });
    await prisma.address.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return prismaErrorResponse(error, res, "Delete address error");
  }
});

// GET /orders/:id
router.get(
  "/orders/:id",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const orderId = req.params.id;

      const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      return res.json(order);
    } catch (error) {
      console.error("Fetch order detail error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ==========================================
// Appointments Endpoints
// ==========================================

function appointmentDateTime(date: Date, time: string) {
  const day = date.toISOString().slice(0, 10);
  return new Date(`${day}T${time}:00`);
}

async function completePastAppointments(userId: string) {
  const active = await prisma.appointment.findMany({
    where: { userId, status: "CONFIRMED" },
    select: { id: true, date: true, time: true },
  });
  const completedIds = active
    .filter(
      (appointment) =>
        appointmentDateTime(appointment.date, appointment.time) < new Date(),
    )
    .map((appointment) => appointment.id);
  if (completedIds.length) {
    await prisma.appointment.updateMany({
      where: { id: { in: completedIds } },
      data: { status: "COMPLETED" },
    });
  }
}

// GET /appointments
router.get(
  "/appointments",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      await completePastAppointments(userId);
      const appointments = await prisma.appointment.findMany({
        where: { userId },
        include: { review: true },
        orderBy: { date: "desc" },
      });
      return res.json(appointments);
    } catch (error) {
      return prismaErrorResponse(error, res, "Fetch appointments error");
    }
  },
);

// POST /appointments
router.post(
  "/appointments",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { salonId, service, date, time } = req.body;

      if (!salonId || !service || !date || !time) {
        return res
          .status(400)
          .json({ error: "Missing salonId, service, date or time" });
      }

      const hour = parseInt(time.split(":")[0], 10);
      if (hour < 10 || hour >= 21) {
        return res.status(400).json({ error: "Bookings are available between 10:00 AM and 9:00 PM" });
      }

      const dayStart = new Date(`${date}T00:00:00`);
      const dayEnd = new Date(`${date}T23:59:59`);
      const conflict = await prisma.appointment.findFirst({
        where: {
          salonId,
          date: { gte: dayStart, lte: dayEnd },
          time,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });
      if (conflict) {
        return res.status(409).json({ error: "This time slot is already booked" });
      }

      const appointment = await prisma.appointment.create({
        data: {
          userId,
          salonId,
          service,
          date: new Date(date),
          time,
          startTime: time,
          endTime: `${(hour + 1).toString().padStart(2, "0")}:${time.split(":")[1]}`,
          paymentMethod: "PAY_AT_SALON",
          status: "PENDING",
        },
      });

      return res.status(201).json(appointment);
    } catch (error) {
      return prismaErrorResponse(error, res, "Book appointment error");
    }
  },
);

// PUT /appointments/:id (Reschedule or Cancel)
router.put(
  "/appointments/:id",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const appointmentId = req.params.id;
      const { date, time, status, service, notes } = req.body;

      const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, userId },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      const updateData: Record<string, unknown> = {};
      if (status === "CANCELLED") updateData.status = "CANCELLED";
      if (appointment.status === "PENDING") {
        if (date) { updateData.date = new Date(`${date}T00:00:00`); }
        if (time) { updateData.time = time; updateData.startTime = time; }
        if (service) updateData.service = service;
        if (notes !== undefined) updateData.notes = notes;
      }

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: updateData,
      });

      return res.json(updated);
    } catch (error) {
      return prismaErrorResponse(error, res, "Update appointment error");
    }
  },
);

router.post(
  "/appointments/:id/review",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const appointmentId = req.params.id;
      const rating = Number(req.body.rating);
      const comment = String(req.body.comment || "").trim();
      if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
        return res
          .status(400)
          .json({ error: "A rating from 1 to 5 and a review are required" });
      }

      await completePastAppointments(userId);
      const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, userId },
        include: { review: true },
      });
      if (!appointment)
        return res.status(404).json({ error: "Appointment not found" });
      if (appointment.status !== "COMPLETED") {
        return res.status(400).json({
          error: "Reviews are available after an appointment is completed",
        });
      }
      if (appointment.review) {
        return res
          .status(409)
          .json({ error: "This appointment has already been reviewed" });
      }

      const review = await prisma.review.create({
        data: {
          rating,
          comment,
          salonId: appointment.salonId,
          userId,
          appointmentId,
        },
        include: { user: { select: { name: true } } },
      });
      return res.status(201).json(review);
    } catch (error) {
      return prismaErrorResponse(error, res, "Create review error");
    }
  },
);

router.get("/salons/:salonId/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { salonId: req.params.salonId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;
    return res.json({ reviews, averageRating, count: reviews.length });
  } catch (error) {
    return prismaErrorResponse(error, res, "Fetch salon reviews error");
  }
});

export default router;
