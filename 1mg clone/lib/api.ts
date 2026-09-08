const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured.');
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
};

/** Fetches from the Express API and always includes the HTTP-only auth cookie. */
export async function apiFetch(path: string, options: ApiOptions = {}) {
  const { body, headers, ...requestOptions } = options;
  const isJsonBody = body !== null && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob);

  return fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
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
