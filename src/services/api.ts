import { EventItem, FakeDoor, UsageData, EventSeriesPoint, TopPagePoint, User } from "../types";

const API_BASE = "/api";
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

  const response = await fetch(`${API_BASE}${endpoint}`, {
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
    const data = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.session?.access_token) {
      setStoredToken(data.session.access_token);
    }
    return data;
  },

  async login(email: string, password: string) {
    const data = await request("/auth/login", {
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
      await request("/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    } finally {
      clearStoredToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    const data = await request("/user/me");
    return data.user;
  },

  // Events
  async getEvents(limit = 50, offset = 0): Promise<{ events: EventItem[] }> {
    return request(`/events?limit=${limit}&offset=${offset}`);
  },

  async getEventById(id: string): Promise<{ event: EventItem }> {
    return request(`/events/${id}`);
  },

  async sendPublicEvent(app_id: string, type: string, data: any, url: string) {
    return request("/events", {
      method: "POST",
      body: JSON.stringify({ app_id, type, data, url }),
    });
  },

  async sendEventFeedback(eventId: string, feedback: string) {
    return request(`/events/${eventId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ feedback }),
    });
  },

  // Fake Doors
  async getFakeDoors(): Promise<{ fake_doors: FakeDoor[] }> {
    return request("/fake-doors");
  },

  async createFakeDoor(feature_name: string, feature_description: string, button_text: string): Promise<{ fake_door: FakeDoor }> {
    return request("/fake-doors", {
      method: "POST",
      body: JSON.stringify({ feature_name, feature_description, button_text }),
    });
  },

  async updateFakeDoor(id: string, updates: Partial<FakeDoor>): Promise<{ fake_door: FakeDoor }> {
    return request(`/fake-doors/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteFakeDoor(id: string) {
    return request(`/fake-doors/${id}`, { method: "DELETE" });
  },

  async recordFakeDoorClick(id: string, feedback_text?: string) {
    return request(`/fake-doors/${id}/clicks`, {
      method: "POST",
      body: JSON.stringify({ feedback_text }),
    });
  },

  async analyzeFakeDoor(id: string): Promise<{ sentiment_score: number; sentiment_summary: string }> {
    return request(`/fake-doors/${id}/analyze`, { method: "POST" });
  },

  // Analytics
  async getAnalyticsEventsOverTime(): Promise<{ series: EventSeriesPoint[] }> {
    return request("/analytics/events-over-time");
  },

  async getAnalyticsTopPages(): Promise<{ top_pages: TopPagePoint[] }> {
    return request("/analytics/top-pages");
  },

  // Usage
  async getUsage(): Promise<UsageData> {
    return request("/usage");
  },

  // Billing
  async createCheckout(plan: "basic" | "pro") {
    return request("/billing/create-checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    });
  },

  async getBillingPortal() {
    return request("/billing/portal", { method: "POST" });
  },
};
