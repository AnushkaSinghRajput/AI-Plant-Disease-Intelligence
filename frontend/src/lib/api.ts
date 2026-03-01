const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function demoLogin(email: string, password: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(`${API_URL}/api/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function getToken(idToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function demoPredict(
  file: File,
  options?: { language?: string }
): Promise<PredictionResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('language', options?.language ?? 'en');
  const res = await fetch(`${API_URL}/api/predictions/demo`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Prediction failed');
  }
  return res.json();
}

export async function uploadAndPredict(
  file: File,
  accessToken: string,
  options?: { useAiRemedies?: boolean; language?: string }
): Promise<PredictionResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('use_ai_remedies', String(options?.useAiRemedies ?? false));
  form.append('language', options?.language ?? 'en');
  const res = await fetch(`${API_URL}/api/predictions/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Prediction failed');
  }
  return res.json();
}

export async function getHistory(accessToken: string, limit = 50): Promise<PredictionLog[]> {
  const res = await fetch(`${API_URL}/api/predictions/history?limit=${limit}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}

export async function getClasses(accessToken?: string): Promise<{ classes: string[] }> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${API_URL}/api/predictions/classes`, { headers });
  if (!res.ok) return { classes: [] };
  return res.json();
}

export interface PredictionResult {
  class_id: string;
  class_name: string;
  confidence: number;
  severity_estimate?: string;
  remedies?: string[];
  report_url?: string;
}

export interface PredictionLog {
  id: string;
  user_id: string;
  image_url: string;
  predicted_class: string;
  confidence: number;
  severity?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_predictions: number;
  unique_users: number;
  top_diseases: { class: string; count: number }[];
  predictions_by_day: { date: string; count: number }[];
}

export async function getAdminAnalytics(accessToken: string): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_URL}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Unauthorized or failed');
  return res.json();
}

export async function semanticSearch(accessToken: string, q: string, limit = 20, crop?: string) {
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (crop) params.set('crop', crop);
  const res = await fetch(`${API_URL}/api/search?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getRecommendations(accessToken: string, disease: string, crop: string, useLlm = false) {
  const params = new URLSearchParams({ disease, crop, use_llm: String(useLlm) });
  const res = await fetch(`${API_URL}/api/recommendations?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to load recommendations');
  return res.json();
}

export async function getGradCam(file: File, accessToken: string) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/explain/gradcam`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) throw new Error('Grad-CAM failed');
  const data = await res.json();
  return data.heatmap_base64 as string;
}

export interface ModelComparison {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  model_size_mb: number;
  inference_ms: number;
  flops_g: number;
  params_m: number;
  input_size: number;
  technical_insights: string[];
  pros: string[];
  cons: string[];
  best_for: string[];
}

export async function getModelComparison(): Promise<ModelComparison[]> {
  const res = await fetch(`${API_URL}/api/models/comparison`);
  if (!res.ok) throw new Error('Failed to load model comparison');
  return res.json();
}

export async function getModelRecommendation(params?: {
  prioritize?: string;
  max_size_mb?: number;
  max_inference_ms?: number;
  min_accuracy?: number;
}) {
  const search = new URLSearchParams();
  if (params?.prioritize) search.set('prioritize', params.prioritize);
  if (params?.max_size_mb != null) search.set('max_size_mb', String(params.max_size_mb));
  if (params?.max_inference_ms != null) search.set('max_inference_ms', String(params.max_inference_ms));
  if (params?.min_accuracy != null) search.set('min_accuracy', String(params.min_accuracy));
  const res = await fetch(`${API_URL}/api/models/recommend?${search}`);
  if (!res.ok) throw new Error('Failed to get recommendation');
  return res.json();
}

export async function getTrainingLogs(limit = 50) {
  const res = await fetch(`${API_URL}/api/models/training-logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load training logs');
  return res.json();
}
