# Speed Box

Speed Box is a Next.js 16 PWA and dashboard platform using Better Auth, MongoDB, Redis, role-based access control, account blocking, and protected media tools.

## Security and access control

### Authentication

- Better Auth manages email/password login, required email verification, password reset, sessions, and optional Google OAuth.
- Production cookies are secure and authentication accepts only `BETTER_AUTH_TRUSTED_ORIGINS`.
- Password-reset requests are rate-limited and always return the same account-neutral success response, preventing email enumeration.
- Email-verification resends have IP and per-account cooldowns.

### Authorization, roles, and blocking

- Every `/dashboard` page and `/api/dashboard/*` endpoint requires a session.
- Roles grant independent `read`, `create`, `update`, and `delete` permissions per dashboard resource. The API enforces these permissions; hiding a UI control is never the security boundary.
- New accounts receive the default `user` role. It can use Profile, Media, and Install until an administrator changes the role permissions.
- `/dashboard/admin/access` assigns roles and blocks accounts. Blocking immediately denies dashboard/API access and revokes all existing sessions for that account.
- Role/sidebar changes invalidate cached authorization data so access changes take effect promptly.

### API protections

- Dashboard writes have a same-origin check to prevent cross-site cookie attacks.
- Dashboard APIs and public abuse-prone endpoints are rate-limited. With Redis configured, limits are shared across Vercel function instances; the in-memory fallback is only for local development.
- Public form submissions must reference a published page and an existing form block. Field count, names, and value size are bounded before storage.
- Uploaded media requires both authentication and Media permission.
- Responses use `nosniff`, frame denial, strict referrer policy, HTTPS transport protection, and a restrictive browser Permissions Policy.

Never set `AuthorizationEnable=false` in production. It disables the role gate and is only for local role setup.

## Environment configuration

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

```env
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=https://app.example.com
BETTER_AUTH_TRUSTED_ORIGINS=https://app.example.com
MONGODB_URI=mongodb+srv://...

# Required in production for shared rate limits and authorization cache
REDIS_HOST=...
REDIS_PORT=6380
REDIS_USERNAME=...
REDIS_PASSWORD=...

GMAIL_USER=...
GMAIL_APP_PASSWORD=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
UPLOADTHING_TOKEN=...
NEXT_PUBLIC_IMGBB_API_KEY=...
```

Use long unique secrets. In production, `BETTER_AUTH_URL`, trusted origins, and OAuth callback URLs must use the final HTTPS domain. Do not expose server secrets with `NEXT_PUBLIC_`.

## Local development

```bash
bun install
bun run dev
bun run lint
npx tsc --noEmit
bun run build
```

Open `http://localhost:3000`, register at `/registration`, verify the email, then give the account an authorized role through `/dashboard/admin/access`. If no role is found then reate one.

## Key routes

| Area                           | Route                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Login and registration         | `/login`, `/registration`                                                                                     |
| Profile and media              | `/dashboard/profile`, `/dashboard/media`                                                                      |
| Access assignment and blocking | `/dashboard/admin/access`                                                                                     |
| Role permissions               | `/dashboard/admin/role`                                                                                       |
| Users and accounts             | `/dashboard/admin/users`, `/dashboard/admin/account`                                                          |
| Pages and form submissions     | `/dashboard/admin/pages`                                                                                      |
| Menu, footer, banner, tracking | `/dashboard/admin/menu`, `/dashboard/admin/footer`, `/dashboard/admin/topbanner`, `/dashboard/admin/tracking` |
| Developer tools                | `/dashboard/developer/sidebar`, `/dashboard/developer/session`                                                |

## Editable content

Component and page defaults live in each feature folder's `data.ts`. Page-owned fields such as contact details remain part of that page's persisted content and editor; there is no shared organization-settings dashboard feature.

## Deploy on Vercel

1. Create a production MongoDB Atlas cluster near the selected Vercel function region.
2. Configure managed Redis and all `REDIS_*` variables. Without Redis, multi-instance rate limiting is not production-safe.
3. Add all production secrets in Vercel **Project Settings → Environment Variables**; use separate Preview credentials.
4. If Google sign-in is enabled, add `https://your-domain/api/auth/v1/callback/google` as its redirect URI.
5. Enable Vercel Fluid compute, Vercel alerts, and MongoDB Atlas autoscaling. Keep functions close to MongoDB.
6. Before launch, test sign-in, a blocked account, each role permission, unauthorized API access, rate limiting, and media uploads.

## Capacity: 1M–10M users

There is no fixed “user limit”: registered accounts, monthly-active users, concurrent users, requests per second, media traffic, and database workload are different limits.

This application is suitable to plan for **about 1M registered accounts** when deployed with a sized Atlas cluster, shared Redis, indexes, caching, monitoring, and representative load testing. It can evolve toward **1M–10M registered accounts**, but **10M is not guaranteed by the current codebase and has not been load-tested**. At that scale, MongoDB query/index performance, Redis throughput, uploads, and traffic shape determine the real limit.

| Metric               | Guidance                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registered accounts  | Plan for 1M first; 10M needs measured capacity tests, retention strategy, Atlas sizing, and possibly sharding.                                                  |
| Vercel functions     | Vercel automatically scales functions. Current documented automatic concurrency reaches 30,000 on Pro and 100,000+ on Enterprise, subject to plan/burst limits. |
| One million requests | A billing allowance for function invocations, not one million users. Cached page views reduce invocations; API/dashboard traffic does not.                      |
| Database             | Use Atlas autoscaling and Performance Advisor; monitor CPU, memory, connections, slow queries, and indexes.                                                     |
| Launch validation    | Load-test staging with p95 latency and error-rate targets, including a gradual ramp and expected peak.                                                          |

Primary references: [Vercel Functions](https://vercel.com/docs/functions), [Vercel concurrency scaling](https://vercel.com/docs/functions/concurrency-scaling), [Vercel function limits](https://vercel.com/docs/functions/limitations), and [MongoDB Atlas scalability](https://www.mongodb.com/docs/atlas/architecture/current/scalability/).

## Content tools

- `/dashboard/admin/menu` manages three independent menu designs; publishing one makes it the only published menu.
- `/dashboard/admin/pages` creates pages, edits page/section/form blocks, previews drafts, publishes pages, and reviews form submissions.
- Footer, Top Banner, WhatsApp, tracking, and navigation settings are persisted in MongoDB and revalidated for public rendering.
- Users manage their own media; privileged users can manage all media.

## Production checklist

- [ ] `AuthorizationEnable` is not `false`.
- [ ] Redis is configured and monitored.
- [ ] MongoDB Atlas access is restricted; backups and autoscaling are enabled.
- [ ] No secrets are committed or exposed to the browser.
- [ ] Trusted origins and OAuth redirects are exact HTTPS origins.
- [ ] Roles follow least privilege; blocked-user and permission tests pass.
- [ ] Vercel/Atlas alerts, monitoring, and a load-test baseline exist.
