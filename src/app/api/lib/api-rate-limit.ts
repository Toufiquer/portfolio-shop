/*
|-----------------------------------------
| setting up api-rate-limit.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import { incrementCounter } from "@/app/api/lib/redis";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientIdentity(request: Request) {
  // Vercel sets this header from the edge. Prefer it over headers that are
  // easier for a client to spoof when running locally or behind another proxy.
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function tooManyRequests(retryAfter: number) {
  return Response.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(Math.max(1, retryAfter)) },
    },
  );
}

export function rateLimit(request: Request, scope: string, limit = 60, windowMs = 60_000) {
  const identity = clientIdentity(request);
  const key = `${scope}:${identity}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (bucket.count >= limit) {
    return tooManyRequests(Math.ceil((bucket.resetAt - now) / 1000));
  }
  bucket.count += 1;
  return null;
}

/**
 * Vercel-safe limiter. Redis is shared by all function instances, unlike an
 * in-memory Map. Keep the synchronous `rateLimit` above for local-only
 * call-sites; use this at deployment boundaries and public abuse-prone APIs.
 */
export async function rateLimitDistributed(request: Request, scope: string, limit = 60, windowMs = 60_000) {
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const count = await incrementCounter(`webapps:rate-limit:${scope}:${clientIdentity(request)}`, ttlSeconds);
  if (count === null) return rateLimit(request, scope, limit, windowMs);
  return count > limit ? tooManyRequests(ttlSeconds) : null;
}
