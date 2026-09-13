const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!configuredApiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured.');
}

// Accept either http://localhost:5000 or http://localhost:5000/api in env files,
// then keep a single canonical API prefix for every browser request.
const API_URL = `${configuredApiUrl.replace(/\/+$/, '').replace(/\/api$/, '')}/api`;

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
};

/** Fetches from the Express API and always includes the HTTP-only auth cookie. */
export async function apiFetch(path: string, options: ApiOptions = {}) {
  const { body, headers, ...requestOptions } = options;
  const isJsonBody = body !== null && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob);
  const endpoint = path.replace(/^\/?api(?:\/|$)/, '').replace(/^\//, '');

  return fetch(`${API_URL}/${endpoint}`, {
    ...requestOptions,
    credentials: 'include',
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : body,
  });
}

export async function readApiError(response: Response, fallback: string) {
  try {
    const payload: unknown = await response.json();
    if (typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string') return payload.message;
  } catch {
    // A response without JSON still receives a useful UI error.
  }
  return fallback;
}
