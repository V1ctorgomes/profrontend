/**
 * Base da API (igual ao CRM):
 * - Se NEXT_PUBLIC_API_URL estiver definido, usa direto.
 * - No browser sem a variável, usa /api/proxy (mesmo domínio → Next repassa ao backend).
 * - No SSR, usa INTERNAL_API_URL ou BACKEND_INTERNAL_URL.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '').trim();
  if (fromEnv) {
    return fromEnv.endsWith('/api') ? fromEnv : `${fromEnv}/api`;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/proxy`;
  }

  const internal = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.INTERNAL_API_URL ||
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
    const message =
      (error as { message?: string | string[] }).message ??
      'Erro ao processar requisição';
    throw new ApiError(
      Array.isArray(message) ? message[0] : message,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
