function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '').trim();
  if (fromEnv) return fromEnv.endsWith('/api') ? fromEnv : `${fromEnv}/api`;

  if (typeof window !== 'undefined') {
    return 'http://localhost:3001/api';
  }

  const internal = process.env.INTERNAL_API_URL?.replace(/\/$/, '').trim();
  if (internal) return internal.endsWith('/api') ? internal : `${internal}/api`;

  return 'http://localhost:3001/api';
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

  const response = await fetch(`${getApiUrl()}${endpoint}`, {
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
