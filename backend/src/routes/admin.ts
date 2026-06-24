import { Router, Response } from "express";
import prisma from "../services/db";
import { authenticate } from "../middleware/auth";
import { requireRole, RoleRequest } from "../middleware/roles";

const router = Router();
const auth = [authenticate, requireRole("ADMIN")];

// ─── Salons ──────────────────────────────────────────────────

router.get("/salons", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const salons = await prisma.salon.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(salons);
  } catch (error) {
    console.error("Admin list salons error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/salons/:id", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!["PENDING", "APPROVED", "REJECTED", "DISABLED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const salon = await prisma.salon.update({
      where: { id: req.params.id },
      data: { status },
    });
    return res.json(salon);
  } catch (error) {
    console.error("Admin update salon error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Products ────────────────────────────────────────────────

router.get("/products", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const showArchived = req.query.archived === "true";
    const products = await prisma.product.findMany({
      where: showArchived ? {} : { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(products);
  } catch (error) {
    console.error("Admin list products error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products/:id/restore", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: true },
    });
    return res.json(product);
  } catch (error) {
    console.error("Admin restore product error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const { name, brand, category, price, image, gallery, description, ingredients, slug: rawSlug } = req.body;
    if (!name || !brand || !category || !price || !image) {
      return res.status(400).json({ error: "Missing required product fields" });
    }
    const slug = rawSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const product = await prisma.product.create({
      data: { slug, name, brand, category, price: parseFloat(price), image, gallery: gallery || [], description: description || "", ingredients: ingredients || [] },
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error("Admin create product error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/products/:id", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json(product);
  } catch (error) {
    console.error("Admin update product error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/products/:id", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    return res.json({ success: true });
  } catch (error) {
    console.error("Admin archive product error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Journal ─────────────────────────────────────────────────

router.get("/journals", ...auth, async (_req: RoleRequest, res: Response) => {
  try {
    const articles = await prisma.journalArticle.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(articles);
  } catch (error) {
    console.error("Admin list journals error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/journals", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const { title, excerpt, category, cover, readingTime, content, author, date, slug: rawSlug } = req.body;
    if (!title || !category || !cover || !date) {
      return res.status(400).json({ error: "Missing required journal fields" });
    }
    const slug = rawSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const article = await prisma.journalArticle.create({
      data: { slug, title, excerpt: excerpt || "", category, cover, readingTime: readingTime || "5 min", content: content || [], author: author || "Aûra Editorial", date },
    });
    return res.status(201).json(article);
  } catch (error) {
    console.error("Admin create journal error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/journals/:id", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const article = await prisma.journalArticle.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json(article);
  } catch (error) {
    console.error("Admin update journal error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/journals/:id", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    await prisma.journalArticle.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Admin delete journal error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Orders ──────────────────────────────────────────────────

router.get("/orders", ...auth, async (_req: RoleRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true } }, items: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(orders);
  } catch (error) {
    console.error("Admin list orders error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/orders/:id", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const { status, trackingNumber } = req.body;
    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    const order = await prisma.order.update({ where: { id: req.params.id }, data });
    return res.json(order);
  } catch (error) {
    console.error("Admin update order error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Users ───────────────────────────────────────────────────

router.get("/users", ...auth, async (_req: RoleRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (error) {
    console.error("Admin list users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Salon Delete ────────────────────────────────────────────

router.delete("/salons/:id", ...auth, async (req: RoleRequest, res: Response) => {
  try {
    const salon = await prisma.salon.findUnique({ where: { id: req.params.id } });
    if (!salon) return res.status(404).json({ error: "Salon not found" });
    await prisma.user.delete({ where: { id: salon.userId } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Admin delete salon error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Appointments ────────────────────────────────────────────

router.get("/appointments", ...auth, async (_req: RoleRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(appointments);
  } catch (error) {
    console.error("Admin list appointments error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Public data endpoints ───────────────────────────────────

router.get("/public/salons", async (_req, res) => {
  try {
    const salons = await prisma.salon.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    return res.json(salons);
  } catch (error) {
    console.error("Public list salons error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/public/salons/:slug", async (req, res) => {
  try {
    const salon = await prisma.salon.findFirst({
      where: { slug: req.params.slug, status: "APPROVED" },
    });
    if (!salon) return res.status(404).json({ error: "Salon not found" });
    return res.json(salon);
  } catch (error) {
    console.error("Public get salon error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/public/products", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(products);
  } catch (error) {
    console.error("Public list products error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/public/products/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, isActive: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (error) {
    console.error("Public get product error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/public/journals", async (_req, res) => {
  try {
    const articles = await prisma.journalArticle.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(articles);
  } catch (error) {
    console.error("Public list journals error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/public/journals/:slug", async (req, res) => {
  try {
    const article = await prisma.journalArticle.findFirst({
      where: { slug: req.params.slug, isPublished: true },
    });
    if (!article) return res.status(404).json({ error: "Article not found" });
    return res.json(article);
  } catch (error) {
    console.error("Public get journal error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
