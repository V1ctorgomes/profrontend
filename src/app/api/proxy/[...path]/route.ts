import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizeApiBase(raw: string): string {
  const base = raw.replace(/\/$/, '').trim();
  return base.endsWith('/api') ? base : `${base}/api`;
}

function backendBase(): string {
  const candidates = [
    process.env.BACKEND_INTERNAL_URL,
    process.env.INTERNAL_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean) as string[];

  if (candidates.length > 0) {
    return normalizeApiBase(candidates[0]);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Defina INTERNAL_API_URL ou BACKEND_INTERNAL_URL no EasyPanel (frontend).',
    );
  }

  return 'http://127.0.0.1:3001/api';
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  let target: string;

  try {
    const path = pathSegments.join('/');
    target = `${backendBase()}/${path}${request.nextUrl.search}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Configuração inválida';
    return Response.json({ message }, { status: 500 });
  }

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === 'host' ||
      lower === 'connection' ||
      lower === 'content-length' ||
      lower === 'origin' ||
      lower === 'referer'
    ) {
      return;
    }
    headers.set(key, value);
  });

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === 'transfer-encoding' || lower === 'connection') return;
      responseHeaders.set(key, value);
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[proxy] falha ao conectar:', target, error);
    return Response.json(
      {
        message:
          'Backend indisponível. Verifique INTERNAL_API_URL no frontend e se o backend está verde.',
        target,
      },
      { status: 502 },
    );
  }
}

type RouteCtx = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, ctx: RouteCtx): Promise<Response> {
  const { path } = await ctx.params;
  return proxyRequest(request, path ?? []);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
