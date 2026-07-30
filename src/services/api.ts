import { EventItem, FakeDoor, UsageData, EventSeriesPoint, TopPagePoint, User } from "../types";

const TOKEN_KEY = "apppulse_auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "An unexpected error occurred");
  }

  return data;
}

export const api = {
  // Auth
  async signup(email: string, password: string) {
    const data = await request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.session?.access_token) {
      setStoredToken(data.session.access_token);
    }
    return data;
  },

  async login(email: string, password: string) {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.session?.access_token) {
      setStoredToken(data.session.access_token);
    }
    return data;
  },

  async logout() {
    try {
      await request("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    } finally {
      clearStoredToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    const data = await request("/api/user/me");
    return data.user;
  },

  // Events
  async getEvents(limit = 50, offset = 0): Promise<{ events: EventItem[] }> {
    return request(`/api/events?limit=${limit}&offset=${offset}`);
  },

  async getEventById(id: string): Promise<{ event: EventItem }> {
    return request(`/api/events/${id}`);
  },

  async sendPublicEvent(app_id: string, type: string, data: any, url: string) {
    return request("/api/events", {
      method: "POST",
      body: JSON.stringify({ app_id, type, data, url }),
    });
  },

  async sendEventFeedback(eventId: string, feedback: string) {
    return request(`/api/events/${eventId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ feedback }),
    });
  },

  // Fake Doors
  async getFakeDoors(): Promise<{ fake_doors: FakeDoor[] }> {
    return request("/api/fake-doors");
  },

  async createFakeDoor(feature_name: string, feature_description: string, button_text: string): Promise<{ fake_door: FakeDoor }> {
    return request("/api/fake-doors", {
      method: "POST",
      body: JSON.stringify({ feature_name, feature_description, button_text }),
    });
  },

  async updateFakeDoor(id: string, updates: Partial<FakeDoor>): Promise<{ fake_door: FakeDoor }> {
    return request(`/api/fake-doors/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteFakeDoor(id: string) {
    return request(`/api/fake-doors/${id}`, { method: "DELETE" });
  },

  async recordFakeDoorClick(id: string, feedback_text?: string) {
    return request(`/api/fake-doors/${id}/clicks`, {
      method: "POST",
      body: JSON.stringify({ feedback_text }),
    });
  },

  async analyzeFakeDoor(id: string): Promise<{ sentiment_score: number; sentiment_summary: string }> {
    return request(`/api/fake-doors/${id}/analyze`, { method: "POST" });
  },

  // Analytics
  async getAnalyticsEventsOverTime(): Promise<{ series: EventSeriesPoint[] }> {
    return request("/api/analytics/events-over-time");
  },

  async getAnalyticsTopPages(): Promise<{ top_pages: TopPagePoint[] }> {
    return request("/api/analytics/top-pages");
  },

  // Usage
  async getUsage(): Promise<UsageData> {
    return request("/api/usage");
  },

  // Billing
  async createCheckout(plan: "basic" | "pro") {
    return request("/api/billing/create-checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    });
  },

  async getBillingPortal() {
    return request("/api/billing/portal", { method: "POST" });
  },
};
