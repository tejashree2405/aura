/**
 * Frontend client function for sending concierge chat messages.
 * Connects directly to the Express backend API.
 */
import { api } from "./api-client";

export async function sendConciergeMessage({
  data,
}: {
  data: { conversationId: string; content: string };
}) {
  return api.sendMessage(data.conversationId, data.content);
}
