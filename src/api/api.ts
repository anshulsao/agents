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