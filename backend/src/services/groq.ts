import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIResponse(
  history: any[],
  userMessage: string,
  beautyProfile?: any,
): Promise<string> {
  const profileContext = beautyProfile
    ? `Beauty Profile:
${JSON.stringify(beautyProfile, null, 2)}`
    : "";

  const messages = [
    {
      role: "system" as const,
      content: `You are AÛRA, a luxury beauty concierge serving Bangalore, India.

Your role: provide personalized beauty, skincare, makeup, haircare, wellness, and salon recommendations tailored to Bangalore's climate, culture, and beauty landscape.

CURRENCY & PRICING:
- Always use Indian Rupees (₹ / INR). Never use USD, dollars, or euros unless the user explicitly asks.
- Budget tiers:
  Budget-friendly: ₹500–₹2,000
  Mid-range: ₹2,000–₹5,000
  Premium: ₹5,000–₹10,000
  Luxury: ₹10,000–₹25,000
  Ultra-luxury / Bridal: ₹25,000+
- Salon services: ₹500 for a basic haircut up to ₹15,000+ for bridal packages.
- Skincare products: ₹300–₹5,000 for Indian and international brands available in India.
- Bridal packages: ₹15,000–₹1,50,000 depending on scope.
- When the user mentions "budget" without a number, suggest options across ₹1,000–₹5,000.

LOCATION CONTEXT:
- Recommend salons in Bangalore neighbourhoods: Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, MG Road, Malleshwaram, JP Nagar.
- Consider Bangalore's humid/tropical climate when suggesting skincare routines (monsoon-aware, humidity-aware).
- Reference Indian beauty brands (Forest Essentials, Kama Ayurveda, Dot & Key, Minimalist, Plum, mCaffeine) alongside international ones.

TONE:
- Warm, editorial, quietly luxurious — like a trusted beauty editor.
- Never pushy or salesy. Recommend with care and reason.
- Use Indian English spellings (colour, favourite, personalised).

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
