

-------------------------------------
Audit the existing Shop codebase for dashboard sidebar and role permissions, CMS pages and published-page data, database/service/API patterns, metadata generation, and cache invalidation relevant to SEO Settings for Layout and CMS pages.

Do not edit files, install packages, or run tests. Preserve all existing worktree changes. Report the exact files and contracts the SEO Settings feature should follow, plus any decisions that need approval before implementation. Then stop.
-------------------------------------
Based on the audit, propose the smallest data model and behavior for SEO Settings. Support only two target types: global Layout and one published CMS page.

Include title, description, social sharing image, canonical URL, and an optional focus keyword used only as an internal dashboard planning field. If no target is selected, default to Layout. Explain duplicate-record handling, behavior for unpublished or deleted pages, permissions, and cache invalidation.

Do not edit files or implement anything. Return the proposed schema and API contract for review, then stop.
-------------------------------------
Implement the approved SEO Settings data model and server-side CRUD APIs/services for Layout and published CMS pages, following the existing Shop architecture and permission rules.

Enforce authorization and input validation on the server. Prevent duplicate settings for the same target, handle missing or unpublished pages safely, and invalidate relevant caches after changes.

Read the repository instructions and installed Next.js documentation relevant to any Next.js code you change. Preserve unrelated worktree changes. Do not render hidden SEO text or add meta-keyword tags. Do not proceed to dashboard UI or route metadata integration. Report changed files and checks performed, then stop.
-------------------------------------
Implement the “SEO Settings” dashboard sidebar entry and management page using the existing Shop sidebar, role-permission, and UI patterns.

Include an “Add SEO Settings” action, a target selector for Layout and published CMS pages, and a responsive grid of saved records. Provide Preview, Edit, and Delete actions; require confirmation before deletion. If no target is selected, use Layout. Connect the UI to the approved server APIs and show loading, empty, and error states.

Read the repository instructions and relevant installed Next.js documentation before changing Next.js code. Preserve unrelated worktree changes. Do not add hidden public content, meta-keyword tags, or SEO content intended only for crawlers. Do not proceed to route metadata or sitemap work. Report changed files and checks performed, then stop.
-------------------------------------
Connect saved SEO Settings to the existing Next.js metadata generation for the root layout and published CMS page routes.

Use Layout settings as global defaults. A specific CMS page’s settings must apply only to that page. Preserve current page metadata as a fallback when no SEO record exists. Apply title, description, social sharing image, and canonical URL where supported by the approved model. Treat focus keywords as dashboard-only data.

Read the repository instructions and installed Next.js metadata documentation before editing. Preserve unrelated worktree changes. Do not render SEO-only text in hidden elements or add meta-keyword tags. Do not proceed to sitemap or robots work. Report changed files and checks performed, then stop.
-------------------------------------
Add or update the Next.js sitemap and robots configuration for this SEO Settings scope. Include canonical public CMS pages and explicitly approved static public pages. Exclude dashboard, private, unpublished, deleted, and otherwise non-indexable routes.

Read the repository instructions and installed Next.js sitemap and robots documentation before editing. Preserve unrelated worktree changes. Do not change SEO Settings UI or add hidden keyword content. Report changed files and checks performed, then stop.
-------------------------------------
Verify the SEO Settings feature against its acceptance conditions: role-based access, authenticated CRUD behavior, duplicate-target handling, Layout fallback, page-specific metadata, canonical and social metadata, sitemap contents, robots output, and dashboard Preview/Edit/confirmed Delete flows.

Run relevant checks and inspect rendered output where available. Report static/build, API, browser UI, and rendered SEO output separately. Do not claim Google indexing or ranking without Search Console evidence. Do not expand scope or make unrelated changes; if a fix is needed, report the finding and proposed narrow fix before applying it.