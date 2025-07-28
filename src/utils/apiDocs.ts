export async function fetchApiDocs(): Promise<any> {
  try {
    const response = await fetch('/ai-api/docs');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Failed to fetch API docs:', error);
    throw error;
  }
}