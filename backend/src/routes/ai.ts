import { Router, Response } from "express";
import prisma from "../services/db";
import { authenticate, AuthRequest } from "../middleware/auth";
import {
  generateAIResponse,
  generateSessionTitle
} from "../services/groq";
const router = Router();

// GET /ai/sessions
// Lists all chat sessions for the logged-in user
router.get("/sessions", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Check if query parameter 'q' is present for searching
    const q = req.query.q as string;
    if (q) {
      const term = q.trim().toLowerCase();
      // Search titles
      const sessions = await prisma.conversation.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { messages: { some: { content: { contains: term, mode: "insensitive" } } } }
          ]
        },
        orderBy: { updatedAt: "desc" }
      });
      return res.json(sessions);
    }

    const sessions = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });
    return res.json(sessions);
  } catch (error) {
    console.error("List sessions error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /ai/sessions
// Creates a new consultation session
router.post("/sessions", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const session = await prisma.conversation.create({
      data: {
        userId,
        title: "New consultation"
      }
    });
    return res.status(201).json(session);
  } catch (error) {
    console.error("Create session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /ai/sessions/:id
// Retrieves a session and its message history
router.get("/sessions/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const conversationId = req.params.id;

    const session = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });
    if (!session) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" }
    });

    return res.json({
      conversation: session,
      messages
    });
  } catch (error) {
    console.error("Get session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /ai/sessions/:id
// Renames a session
router.put("/sessions/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const conversationId = req.params.id;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    const session = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });
    if (!session) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    const updatedSession = await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: title.trim() }
    });

    return res.json(updatedSession);
  } catch (error) {
    console.error("Rename session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /ai/sessions/:id
// Deletes a session
router.delete("/sessions/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const conversationId = req.params.id;

    const session = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });
    if (!session) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /ai/profile
// Gets the user's beauty profile
router.get("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    let profile = await prisma.beautyProfile.findUnique({
      where: { userId }
    });
    // Create it if it somehow doesn't exist
    if (!profile) {
      profile = await prisma.beautyProfile.create({
        data: { userId }
      });
    }
    return res.json(profile);
  } catch (error) {
    console.error("Get beauty profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /ai/profile
// Upserts user's beauty profile fields
router.post("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = req.body;

    const updatedProfile = await prisma.beautyProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    });

    return res.json({ ok: true, profile: updatedProfile });
  } catch (error) {
    console.error("Upsert beauty profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /ai/chat
// Sends message, invokes LangChain, persists history
router.post("/chat", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: "Missing conversationId or message content" });
    }

    // 1. Fetch the chat session
    const session = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });
    if (!session) {
      return res.status(404).json({ error: "Consultation session not found" });
    }

    // 2. Fetch user messages history
    const existingMessages = await prisma.message.findMany({
      where: { conversationId: conversationId },
      orderBy: { createdAt: "asc" }
    });

    const isFirstUserTurn = !existingMessages.some(m => m.role === "USER");

    // 3. Save the new user message first
    const userMsg = await prisma.message.create({
      data: {
        conversationId: conversationId,
        role: "USER",
        content: content.trim()
      }
    });

    // 4. Fetch the member's beauty profile
    let beautyProfile = await prisma.beautyProfile.findUnique({
      where: { userId }
    });

    // 5. Generate AI response
    let assistantText = "";
    try {
      const history = existingMessages.map(m => ({ role: m.role, content: m.content }));
      assistantText = await generateAIResponse(history, content.trim(), beautyProfile);
    } catch (e: any) {
      console.error("LangChain generation failed:", e);
      assistantText = `I'm momentarily offline. Please check that GROQ_API_KEY is configured. Error: ${e.message}`;
    }

    // 6. Save AI message
    const assistantMsg = await prisma.message.create({
      data: {
        conversationId: conversationId,
        role: "ASSISTANT",
        content: assistantText
      }
    });

    // 7. Update session timestamp
    let updatedTitle = session.title;

    if (isFirstUserTurn) {
      try {
        const enrichment = await generateSessionTitle(content.trim());
        updatedTitle = enrichment.title;
      } catch (err) {
        console.warn("First turn title enrichment failed, using default title");
      }
    }

    const updatedSession = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        title: updatedTitle,
        updatedAt: new Date()
      }
    });

    return res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      conversation: updatedSession
    });
  } catch (error) {
    console.error("AI Chat handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
