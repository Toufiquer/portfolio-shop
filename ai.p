
### Site-wide
- `src/app/manifest.ts`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/[...pagePath]/page.tsx`
- `src/components/whatsapp/WhatsAppButton.tsx`

### Top Banners, Menus & Footers
- `src/components/topbanner/topbanner-1/` through `topbanner-3/`
- `src/components/menu/menu-1/` through `menu-3/`
- `src/components/footer/footer-1/` through `footer-3/`
### Forms & Containers
- `src/components/form/form-1/` through `form-3/`
- `src/components/container/container-1/` through `container-2/`

### All 48 Section Variants
- `src/components/sections/section-1/` through `section-48/`

Review every variant, including unused ones, for outdated content, contact details, links, images, and CTAs.

### Page Templates
Review all directories under `src/components/pages/`, including:

- `home/`, `about-us/`, `company-story/`, `about-the-country/`, `contact-us/`
- `program-pages/data.ts`
- `country-directory/`, `visa-requirements/`, `visa-services/`, `visa-service-catalogue/`, `visa-consultancy/`, `visa-application-support/`, `visa-insights/`
- `frequently-ask-questions/`, `whatsapp-faq/`
- `leadership-team/`, `team-member/`
- `privacy-policy/`, `refund-policy/`, `cookie-policy/`, `security/`, `delivery-policy/`, `site-terms-and-conditions/`, `terms-and-condition/`
======================================================================================

Adapt public content to Section 1. Do not assume the company offers services suggested by existing template names.

### CMS & Default Data
- `src/components/pages/PageIndex.tsx`
- `src/components/pages/PageBlocks.tsx`
- `src/redux/features/dashboard/pages/pagesSlice.ts`
- `src/lib/defaults/import-data.ts`

Update relevant defaults and registrations while preserving CMS functionality. Review saved published pages for outdated content.

### Additional Files
Search the entire project for old branding, contact information, social links, industry-specific content, metadata, logos, and hardcoded public text. Update additional relevant files as necessary.

## 3. Execution Instructions

1. Analyze: Read Section 1 and inspect the complete project.
2. Update: Modify all relevant public components, page templates, CMS defaults, branding, content, images, links, and SEO.
3. Adapt: Rewrite content for the new business industry without inventing unconfirmed information.
4. Preserve: Keep existing functionality, reusable architecture, responsive design, and technical integrations intact.
5. Verify: Search for outdated branding; run available TypeScript, lint, test, and build checks.
6. Report: Summarize modified files, completed changes, validation results, and any unresolved issues.

Mandatory: Implement changes directly in the project, not just provide suggestions. Do not stop after updating the homepage. Review all 48 sections, component variants, and public page templates. Do not alter unrelated technical functionality.

FINAL RULE: Only Section 1 may change between businesses. All other sections must remain reusable without editing.
