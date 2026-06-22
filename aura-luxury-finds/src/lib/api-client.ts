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
  // Authentication

  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  signup: (name: string, email: string, password: string) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  getMe: () =>
    request("/auth/me", {
      method: "GET",
    }),

  updateMe: (patch: { name?: string; phone?: string; avatarUrl?: string | null }) =>
    request("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  uploadProfileImage: (image: string) =>
    request("/auth/profile-image", {
      method: "POST",
      body: JSON.stringify({ image }),
    }),

  // AI Sessions

  listSessions: (q?: string) =>
    request(`/ai/sessions${q ? `?q=${encodeURIComponent(q)}` : ""}`, {
      method: "GET",
    }),

  createSession: () =>
    request("/ai/sessions", {
      method: "POST",
    }),

  getSession: (id: string) =>
    request(`/ai/sessions/${id}`, {
      method: "GET",
    }),

  renameSession: (id: string, title: string) =>
    request(`/ai/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
      }),
    }),

  deleteSession: (id: string) =>
    request(`/ai/sessions/${id}`, {
      method: "DELETE",
    }),

  sendMessage: (conversationId: string, content: string) =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        content,
      }),
    }),

  // Beauty Profile

  getBeautyProfile: () =>
    request("/ai/profile", {
      method: "GET",
    }),

  upsertBeautyProfile: (profile: Record<string, unknown>) =>
    request("/ai/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    }),

  // Orders

  listOrders: () =>
    request("/orders", {
      method: "GET",
    }),

  createOrder: (order: { items: unknown[]; total: number }) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),

  getOrderDetail: (id: string) =>
    request(`/orders/${id}`, {
      method: "GET",
    }),

  // Appointments

  listAppointments: () =>
    request("/appointments", {
      method: "GET",
    }),

  bookAppointment: (appointment: {
    salonId: string;
    service: string;
    date: string;
    time: string;
  }) =>
    request("/appointments", {
      method: "POST",
      body: JSON.stringify(appointment),
    }),

  updateAppointment: (
    id: string,
    patch: {
      date?: string;
      time?: string;
      status?: string;
    },
  ) =>
    request(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),

  createReview: (appointmentId: string, rating: number, comment: string) =>
    request(`/appointments/${appointmentId}/review`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),

  listSalonReviews: (salonId: string) =>
    request(`/salons/${encodeURIComponent(salonId)}/reviews`, {
      method: "GET",
    }),
};
