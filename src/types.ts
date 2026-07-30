export interface User {
  id: string;
  email: string;
  plan: "free" | "basic" | "pro";
  app_id: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface EventItem {
  id: string;
  user_id: string;
  app_id: string;
  type: "crash" | "rage_click" | "long_pause" | "feedback";
  page_url: string;
  raw_data: any;
  user_feedback: string | null;
  ai_diagnosis: string | null;
  ai_skipped_reason: string | null;
  is_anonymized: boolean;
  created_at: string;
}

export interface FakeDoor {
  id: string;
  feature_name: string;
  feature_description: string;
  button_text: string;
  is_active: boolean;
  total_clicks: number;
  sentiment_score: number | null;
  sentiment_summary: string | null;
  created_at: string;
}

export interface UsageData {
  plan: "free" | "basic" | "pro";
  events_used: number;
  events_limit: number;
  percent_used: number;
  period_start: string;
  period_end: string;
}

export interface EventSeriesPoint {
  date: string;
  crash: number;
  rage_click: number;
  long_pause: number;
  feedback: number;
}

export interface TopPagePoint {
  page_url: string;
  count: number;
}
