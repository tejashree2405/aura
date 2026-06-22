/**
 * Frontend client functions for Aûra concierge CRUD operations.
 * Connects directly to the Express backend API.
 */
import { api } from "./api-client";

export async function listConversations() {
  return api.listSessions();
}

export async function createConversation() {
  return api.createSession();
}

export async function getConversation({ data }: { data: { id: string } }) {
  return api.getSession(data.id);
}

export async function renameConversation({ data }: { data: { id: string; title: string } }) {
  return api.renameSession(data.id, data.title);
}

export async function deleteConversation({ data }: { data: { id: string } }) {
  return api.deleteSession(data.id);
}

export async function searchConversations({ data }: { data: { q: string } }) {
  return api.listSessions(data.q);
}

export async function getBeautyProfile() {
  return api.getBeautyProfile();
}

export async function upsertBeautyProfile(data: any) {
  return api.upsertBeautyProfile(data);
}
