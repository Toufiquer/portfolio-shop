/*
|-----------------------------------------
| setting up api-rate-limit.ts for the App
|-----------------------------------------
*/

import { createHash } from "node:crypto";
import { isIP } from "node:net";

import { incrementCounter } from "@/app/api/lib/redis";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const maxInMemoryBuckets = 10_000;

function trustedClientIpHeader() {
  const configured = process.env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase();
  if (configured) return configured;
  return process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : null;
}

function clientIdentity(request: Request) {
  const header = trustedClientIpHeader();
  if (!header) return "unknown";
  const value = request.headers.get(header)?.split(",")[0]?.trim();
  return value && isIP(value) ? value.toLowerCase() : "unknown";
}

function identityKey(identity: string) {
  return createHash("sha256").update(identity).digest("hex");
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

function rateLimitIdentity(scope: string, identity: string, limit: number, windowMs: number) {
  const key = `${scope}:${identityKey(identity)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (bucket && bucket.resetAt > now) {
    if (bucket.count >= limit) return tooManyRequests(Math.ceil((bucket.resetAt - now) / 1000));
    bucket.count += 1;
    return null;
  }

  if (bucket) buckets.delete(key);
  if (buckets.size >= maxInMemoryBuckets) {
    for (const [expiredKey, expiredBucket] of buckets) {
      if (expiredBucket.resetAt <= now) buckets.delete(expiredKey);
    }
    if (buckets.size >= maxInMemoryBuckets) return tooManyRequests(Math.ceil(windowMs / 1000));
  }

  buckets.set(key, { count: 1, resetAt: now + windowMs });
  return null;
}

/** Local fallback used when Redis is not configured or reachable. */
export function rateLimit(request: Request, scope: string, limit = 60, windowMs = 60_000) {
  return rateLimitIdentity(scope, clientIdentity(request), limit, windowMs);
}

/**
 * Uses Redis shared by all instances when available, with a bounded local
 * fallback. The supplied identity must already be normalized if it is not an IP.
 */
export async function rateLimitDistributedIdentity(scope: string, identity: string, limit = 60, windowMs = 60_000) {
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const count = await incrementCounter(`webapps:rate-limit:${scope}:${identityKey(identity)}`, ttlSeconds);
  if (count === null) return rateLimitIdentity(scope, identity, limit, windowMs);
  return count > limit ? tooManyRequests(ttlSeconds) : null;
}

export async function rateLimitDistributed(request: Request, scope: string, limit = 60, windowMs = 60_000) {
  return rateLimitDistributedIdentity(scope, clientIdentity(request), limit, windowMs);
}
