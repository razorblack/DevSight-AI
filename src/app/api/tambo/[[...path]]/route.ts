import type { NextRequest } from "next/server";

const DEFAULT_TAMBO_BASE_URL = "https://api.tambo.co";
const DEFAULT_MAX_BODY_BYTES = 5 * 1024 * 1024;

const ALLOWED_METHODS = new Set([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

const FORWARDED_REQUEST_HEADERS = new Set([
  "accept",
  "accept-language",
  "content-type",
  "user-agent",
  "traceparent",
  "tracestate",
  "x-correlation-id",
  "x-request-id",
]);

const SENSITIVE_QUERY_KEYS = new Set([
  "access_token",
  "apikey",
  "api_key",
  "authorization",
  "token",
]);

class PayloadTooLargeError extends Error {
  override name = "PayloadTooLargeError";
}

export const runtime = "nodejs";

function getMaxBodyBytes(): number {
  const raw = process.env.TAMBO_MAX_BODY_BYTES;
  const n = raw == null ? NaN : Number(raw);

  if (raw != null && (!Number.isFinite(n) || n <= 0)) {
    console.error("Tambo proxy misconfigured: TAMBO_MAX_BODY_BYTES is invalid", {
      value: raw,
    });
  }

  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_BODY_BYTES;
}

async function readBodyWithLimit(request: Request, maxBytes: number) {
  if (!request.body) return undefined;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > maxBytes) throw new PayloadTooLargeError("Request body too large");
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

function buildUpstreamHeaders(requestHeaders: Headers, apiKey: string, hasBody: boolean) {
  const headers = new Headers();

  for (const [key, value] of requestHeaders.entries()) {
    const lower = key.toLowerCase();

    if (lower === "authorization") continue;
    if (lower === "cookie") continue;
    if (!FORWARDED_REQUEST_HEADERS.has(lower) && !lower.startsWith("x-tambo-")) {
      continue;
    }

    if (!hasBody && lower === "content-type") continue;

    headers.set(key, value);
  }

  headers.set("authorization", `Bearer ${apiKey}`);
  return headers;
}

function buildUpstreamUrl({
  baseUrl,
  pathSegments,
  requestUrl,
}: {
  baseUrl: string;
  pathSegments: string[];
  requestUrl: URL;
}) {
  const baseWithSlash = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const upstreamUrl = new URL(pathSegments.join("/"), baseWithSlash);

  for (const [key, value] of requestUrl.searchParams.entries()) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) continue;
    upstreamUrl.searchParams.append(key, value);
  }

  return upstreamUrl;
}

function buildDownstreamHeaders(upstreamHeaders: Headers) {
  const headers = new Headers(upstreamHeaders);

  headers.delete("set-cookie");
  headers.delete("content-length");

  for (const key of headers.keys()) {
    if (key.toLowerCase().startsWith("access-control-")) headers.delete(key);
  }

  return headers;
}

async function proxyToTambo(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const apiKey = process.env.TAMBO_API_KEY;
  if (!apiKey) {
    console.error("Tambo proxy misconfigured: TAMBO_API_KEY is not set");
    return Response.json(
      { error: "Service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
      { status: 500 },
    );
  }

  const method = request.method.toUpperCase();
  if (!ALLOWED_METHODS.has(method)) {
    return Response.json(
      { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" },
      {
        status: 405,
        headers: {
          allow: Array.from(ALLOWED_METHODS).join(", "),
        },
      },
    );
  }

  const baseUrl = process.env.TAMBO_BASE_URL || DEFAULT_TAMBO_BASE_URL;
  let parsedBaseUrl: URL;
  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    console.error("Tambo proxy misconfigured: TAMBO_BASE_URL is invalid", {
      baseUrl,
    });
    return Response.json(
      { error: "Service temporarily unavailable", code: "SERVICE_UNAVAILABLE" },
      { status: 500 },
    );
  }

  const requestUrl = new URL(request.url);
  const params = await ctx.params;
  const pathSegments = params.path ?? [];
  if (pathSegments.some((segment) => segment === "..")) {
    return Response.json(
      { error: "Invalid path", code: "INVALID_PATH" },
      { status: 400 },
    );
  }

  const upstreamUrl = buildUpstreamUrl({
    baseUrl: parsedBaseUrl.toString(),
    pathSegments,
    requestUrl,
  });

  try {
    const maxBodyBytes = getMaxBodyBytes();
    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : await readBodyWithLimit(request, maxBodyBytes);

    const upstreamRes = await fetch(upstreamUrl, {
      method,
      headers: buildUpstreamHeaders(request.headers, apiKey, body != null),
      body,
    });

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: buildDownstreamHeaders(upstreamRes.headers),
    });
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return Response.json(
        { error: "Request body too large", code: "PAYLOAD_TOO_LARGE" },
        { status: 413 },
      );
    }

    if (err instanceof Error) {
      console.error("Tambo proxy error", {
        name: err.name,
        message: err.message,
      });
    } else {
      console.error("Tambo proxy error", { err });
    }

    return Response.json(
      { error: "Failed to reach Tambo Cloud", code: "UPSTREAM_UNAVAILABLE" },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxyToTambo(request, ctx);
}

export async function HEAD(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxyToTambo(request, ctx);
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxyToTambo(request, ctx);
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxyToTambo(request, ctx);
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxyToTambo(request, ctx);
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxyToTambo(request, ctx);
}
