import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIResponse(
  history: any[],
  userMessage: string,
  beautyProfile?: any,
  userRole?: string,
): Promise<string> {
  const profileContext = beautyProfile
    ? `\nBeauty Profile:\n${JSON.stringify(beautyProfile, null, 2)}`
    : "";

  const rolePrompts: Record<string, string> = {
    USER: `You are AÛRA, a luxury beauty concierge serving Bangalore, India.
Provide personalised beauty, skincare, makeup, haircare, wellness, and salon recommendations tailored to Bangalore's climate, culture, and beauty landscape.`,
    SALON: `You are AÛRA, an AI business assistant for salon partners in Bangalore, India.
Help salon owners with: business growth strategies, client retention, service menu optimisation, pricing guidance (in ₹), seasonal promotions, staff management, and social media tips for beauty businesses.`,
    ADMIN: `You are AÛRA, an AI platform assistant for the Aûra admin team.
Help with: platform analytics explanations, content strategy for the marketplace and journal, salon approval guidance, user engagement insights, and operational decisions.`,
  };

  const systemPrompt = rolePrompts[userRole || "USER"] || rolePrompts.USER;

  const messages = [
    {
      role: "system" as const,
      content: `${systemPrompt}

CURRENCY & PRICING:
- Always use Indian Rupees (₹ / INR). Never use USD, dollars, or euros unless explicitly asked.
- Budget tiers: Budget-friendly ₹500–₹2,000 · Mid-range ₹2,000–₹5,000 · Premium ₹5,000–₹10,000 · Luxury ₹10,000–₹25,000 · Ultra-luxury/Bridal ₹25,000+
- When the user mentions "budget" without a number, suggest across ₹1,000–₹5,000.

LOCATION: Bangalore neighbourhoods — Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, MG Road, Malleshwaram, JP Nagar.
BRANDS: Forest Essentials, Kama Ayurveda, Dot & Key, Minimalist, Plum, mCaffeine alongside international brands.
TONE: Warm, editorial, quietly luxurious. Indian English spellings. Never pushy.
${profileContext}`,
    },

    ...history.map((msg) => ({
      role: msg.role === "USER" ? "user" : "assistant",
      content: msg.content,
    })),

    {
      role: "user" as const,
      content: userMessage,
    },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messages as any,
    temperature: 0.7,
  });

  return (
    completion.choices[0]?.message?.content ?? "I couldn't generate a response."
  );
}
export async function generateSessionTitle(firstMessage: string) {
  return {
    title: generateConversationTitle(firstMessage),
  };
}

export function generateConversationTitle(firstMessage: string): string {
  const normalized = firstMessage
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const topicRules: Array<[RegExp, string]> = [
    [/brid(e|al| wedding)|wedding/, "Bridal Beauty Planning"],
    [/wellness|calm|ritual|relax|stress/, "Weekly Wellness Ritual"],
    [/skin|acne|pigment|glow|serum|moisturi/, "Personalized Skincare Routine"],
    [/hair|scalp|balayage|colour|color|frizz/, "Personalized Haircare Plan"],
    [/salon|spa|facial|appointment/, "Salon Discovery Consultation"],
    [/makeup|foundation|lipstick|cosmetic/, "Personalized Makeup Guidance"],
    [/product|brand|buy|shopping|budget/, "Curated Beauty Products"],
  ];

  const matched = topicRules.find(([pattern]) => pattern.test(normalized));
  if (matched) return matched[1];

  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "can",
    "compose",
    "do",
    "for",
    "help",
    "how",
    "i",
    "is",
    "make",
    "me",
    "my",
    "of",
    "please",
    "the",
    "to",
    "what",
    "with",
    "you",
  ]);
  const words = normalized
    .split(" ")
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 6)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.length >= 3 ? words.join(" ") : "Personal Beauty Consultation";
}
