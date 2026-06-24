const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3004";

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // ─── Authentication ──────────────────────────────────────────

  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  signup: (name: string, email: string, password: string) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),

  logout: () => request("/auth/logout", { method: "POST" }),

  getMe: () => request("/auth/me", { method: "GET" }),

  updateMe: (patch: { name?: string; phone?: string; avatarUrl?: string | null }) =>
    request("/auth/me", { method: "PATCH", body: JSON.stringify(patch) }),

  uploadProfileImage: (image: string) =>
    request("/auth/profile-image", { method: "POST", body: JSON.stringify({ image }) }),

  // ─── Salon Auth ──────────────────────────────────────────────

  salonRegister: (data: {
    salonName: string; ownerName: string; email: string; password: string;
    phone: string; address?: string; city?: string; description?: string;
    services?: string[]; timings?: string;
  }) => request("/salon/register", { method: "POST", body: JSON.stringify(data) }),

  // ─── Salon Dashboard ────────────────────────────────────────

  getSalonProfile: () => request("/salon/profile", { method: "GET" }),

  updateSalonProfile: (data: Record<string, unknown>) =>
    request("/salon/profile", { method: "PUT", body: JSON.stringify(data) }),

  getSalonAppointments: () => request("/salon/appointments", { method: "GET" }),

  updateSalonAppointment: (id: string, status: string) =>
    request(`/salon/appointments/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

  getAvailableSlots: (salonId: string, date: string) =>
    request(`/salon/slots?salonId=${encodeURIComponent(salonId)}&date=${date}`, { method: "GET" }),

  // ─── Admin ───────────────────────────────────────────────────

  adminListSalons: () => request("/admin/salons", { method: "GET" }),
  adminUpdateSalon: (id: string, status: string) =>
    request(`/admin/salons/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

  adminListProducts: (archived = false) =>
    request(`/admin/products${archived ? "?archived=true" : ""}`, { method: "GET" }),
  adminCreateProduct: (data: Record<string, unknown>) =>
    request("/admin/products", { method: "POST", body: JSON.stringify(data) }),
  adminUpdateProduct: (id: string, data: Record<string, unknown>) =>
    request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  adminDeleteProduct: (id: string) =>
    request(`/admin/products/${id}`, { method: "DELETE" }),
  adminRestoreProduct: (id: string) =>
    request(`/admin/products/${id}/restore`, { method: "POST" }),

  adminListJournals: () => request("/admin/journals", { method: "GET" }),
  adminCreateJournal: (data: Record<string, unknown>) =>
    request("/admin/journals", { method: "POST", body: JSON.stringify(data) }),
  adminUpdateJournal: (id: string, data: Record<string, unknown>) =>
    request(`/admin/journals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  adminDeleteJournal: (id: string) =>
    request(`/admin/journals/${id}`, { method: "DELETE" }),

  adminListOrders: () => request("/admin/orders", { method: "GET" }),
  adminUpdateOrder: (id: string, data: { status?: string; trackingNumber?: string }) =>
    request(`/admin/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  adminListUsers: () => request("/admin/users", { method: "GET" }),
  adminDeleteUser: (id: string) => request(`/admin/users/${id}`, { method: "DELETE" }),
  adminDeleteSalon: (id: string) => request(`/admin/salons/${id}`, { method: "DELETE" }),
  adminListAppointments: () => request("/admin/appointments", { method: "GET" }),

  uploadImage: (image: string, folder?: string) =>
    request("/upload/image", { method: "POST", body: JSON.stringify({ image, folder }) }),

  // ─── Public Data (DB salons/products/journals) ───────────────

  listDbSalons: () => request("/admin/public/salons", { method: "GET" }),
  getDbSalon: (slug: string) => request(`/admin/public/salons/${encodeURIComponent(slug)}`, { method: "GET" }),
  listDbProducts: () => request("/admin/public/products", { method: "GET" }),
  getDbProduct: (slug: string) => request(`/admin/public/products/${encodeURIComponent(slug)}`, { method: "GET" }),
  listDbJournals: () => request("/admin/public/journals", { method: "GET" }),
  getDbJournal: (slug: string) => request(`/admin/public/journals/${encodeURIComponent(slug)}`, { method: "GET" }),

  // ─── AI Sessions ─────────────────────────────────────────────

  listSessions: (q?: string) =>
    request(`/ai/sessions${q ? `?q=${encodeURIComponent(q)}` : ""}`, { method: "GET" }),
  createSession: () => request("/ai/sessions", { method: "POST" }),
  getSession: (id: string) => request(`/ai/sessions/${id}`, { method: "GET" }),
  renameSession: (id: string, title: string) =>
    request(`/ai/sessions/${id}`, { method: "PUT", body: JSON.stringify({ title }) }),
  deleteSession: (id: string) => request(`/ai/sessions/${id}`, { method: "DELETE" }),
  sendMessage: (conversationId: string, content: string) =>
    request("/ai/chat", { method: "POST", body: JSON.stringify({ conversationId, content }) }),

  // ─── Beauty Profile ──────────────────────────────────────────

  getBeautyProfile: () => request("/ai/profile", { method: "GET" }),
  upsertBeautyProfile: (profile: Record<string, unknown>) =>
    request("/ai/profile", { method: "POST", body: JSON.stringify(profile) }),

  // ─── Addresses ────────────────────────────────────────────────

  listAddresses: () => request("/addresses", { method: "GET" }),
  createAddress: (data: Record<string, unknown>) =>
    request("/addresses", { method: "POST", body: JSON.stringify(data) }),
  updateAddress: (id: string, data: Record<string, unknown>) =>
    request(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAddress: (id: string) =>
    request(`/addresses/${id}`, { method: "DELETE" }),

  // ─── Orders ──────────────────────────────────────────────────

  listOrders: () => request("/orders", { method: "GET" }),
  createOrder: (order: { items: unknown[]; total: number; paymentMethod?: string }) =>
    request("/orders", { method: "POST", body: JSON.stringify(order) }),
  getOrderDetail: (id: string) => request(`/orders/${id}`, { method: "GET" }),

  // ─── Appointments ────────────────────────────────────────────

  listAppointments: () => request("/appointments", { method: "GET" }),
  bookAppointment: (appointment: { salonId: string; service: string; date: string; time: string }) =>
    request("/appointments", { method: "POST", body: JSON.stringify(appointment) }),
  updateAppointment: (id: string, patch: { date?: string; time?: string; status?: string }) =>
    request(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  createReview: (appointmentId: string, rating: number, comment: string) =>
    request(`/appointments/${appointmentId}/review`, { method: "POST", body: JSON.stringify({ rating, comment }) }),
  listSalonReviews: (salonId: string) =>
    request(`/salons/${encodeURIComponent(salonId)}/reviews`, { method: "GET" }),
};
