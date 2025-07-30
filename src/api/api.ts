// API utility functions for kubeconfig upload and status


export async function uploadKubeconfig(sessionId: string, file: File): Promise<void> {

  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('kubeconfig', file);

  const res = await fetch(`/ai-api/kubeconfig/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.message || `Upload failed with status ${res.status}`;
    throw new Error(msg);
  }
}

export async function getKubeconfigStatus(sessionId: string): Promise<boolean> {

  const res = await fetch(`/ai-api/kubeconfig/status?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    throw new Error(`Status check failed with status ${res.status}`);
  }
  const data = await res.json();
  return Boolean(data.set);
}

export interface ClusterInfo {
  name: string;
  connected: boolean;
}

export async function getClusterInfo(sessionId: string): Promise<ClusterInfo> {
  const res = await fetch(`/ai-api/kubeconfig/status?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    throw new Error(`Status check failed with status ${res.status}`);
  }
  const data = await res.json();
  return {
    name: data.cluster || 'Unknown Cluster',
    connected: Boolean(data.set)
  };
}

export interface UserInfo {
  username: string;
  email: string;
  name: string;
  id: string;
  userId?: string;
  auth_mode: string;
}

export interface UsagePlan {
  user_id: string;
  cycle_day: number;
  dollar_limit: number;
}

export interface UsageTracker {
  user_id: string;
  cycle_start: string;
  cycle_end: string;
  plan: UsagePlan;
  used_amount: number;
}

export async function getUserInfo(): Promise<UserInfo> {
  const res = await fetch('/ai-api/auth/me');
  if (!res.ok) {
    throw new Error(`Failed to fetch user info: ${res.status}`);
  }
  const data = await res.json();
  
  // Use userId as fallback if id is not present
  if (!data.id && data.user_id) {
    data.id = data.user_id;
  }
  
  return data;
}

export async function getUsageTracker(userId: string): Promise<UsageTracker> {
  const res = await fetch(`/ai-api/usage/tracker?user_id=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch usage tracker: ${res.status}`);
  }
  return await res.json();
}