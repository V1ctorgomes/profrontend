/**
 * Browser: sempre /api/proxy (mesmo domínio, evita CORS).
 * SSR: INTERNAL_API_URL ou NEXT_PUBLIC_API_URL.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/proxy`;
  }

  const internal = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:3001'
  )
    .replace(/\/$/, '')
    .trim();

  return internal.endsWith('/api') ? internal : `${internal}/api`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export async function api<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const raw = (error as { message?: string | string[] }).message;
    const message = Array.isArray(raw)
      ? raw[0]
      : raw ??
        (response.status === 502
          ? 'Backend indisponível. Faça redeploy do backend no EasyPanel.'
          : response.status === 401
            ? 'Sessão expirada. Faça login novamente.'
            : `Erro ao processar requisição (${response.status})`);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
