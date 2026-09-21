const API_BASE_URL = import.meta.env["VITE_API_URL"] || "http://localhost:8000/api/v1";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("edhaas_access_token");
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("edhaas_access_token");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.warn(`[API] Could not connect to backend endpoint ${endpoint}:`, err?.message || err);
    // Return empty array/object fallback if network fails
    return [] as unknown as T;
  }
}
