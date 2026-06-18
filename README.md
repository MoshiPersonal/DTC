# Dolf Training Center (DTC) — Website

**مركز دلف للتدريب** — bilingual (English / Arabic) website for Dolf Training Center,
the training arm of Dolf Technologies.

This repository currently contains a **production-ready static front-end** (vanilla
HTML/CSS/JS) shipped as a Docker image. It is intentionally framework-free and
**structured so it can grow into a CMS-driven, multi-tenant platform** — the content,
theming and i18n are already decoupled along the seams you'll need for that work.

> **Audience:** developers onboarding to enhance the site and evolve it into a
> dynamic, multi-tenant CMS product. Start with [Quick start](#quick-start), then read
> [How it works](#how-it-works) and the [Roadmap](#roadmap-static--cms-driven-multi-tenant).

---

## Table of contents

1. [Current status & vision](#current-status--vision)
2. [Tech stack](#tech-stack)
3. [Quick start](#quick-start)
4. [Dynamic content loading](#dynamic-content-loading)
5. [Project structure](#project-structure)
6. [How it works](#how-it-works)
   - [Bilingual i18n (EN/AR + RTL)](#bilingual-i18n-enar--rtl)
   - [Theming & design tokens](#theming--design-tokens)
   - [Components & sections](#components--sections)
   - [JavaScript behavior](#javascript-behavior)
   - [Accessibility & performance](#accessibility--performance)
7. [Content reference (CMS-ready inventory)](#content-reference-cms-ready-inventory)
8. [Build & deploy with Docker](#build--deploy-with-docker)
9. [Roadmap: static → CMS-driven, multi-tenant](#roadmap-static--cms-driven-multi-tenant)
10. [Coding standards & conventions](#coding-standards--conventions)
11. [Brand reference](#brand-reference)
12. [Known limitations / TODO](#known-limitations--todo)

---

## Current status & vision

| | Static (v1) | Today (v2 — this repo) | Target (planned) |
|---|---|---|---|
| **Rendering** | Static HTML, served by nginx | **Dynamic:** static HTML + CMS content injection | Server-rendered / fully API-driven |
| **Content** | Hard-coded in HTML + `i18n.js` | **Static fallback + CMS optional** | Full CMS-driven content |
| **Languages** | EN + AR, client-side switch | EN + AR, client-side switch (CMS-aware) | CMS-managed locales, per-tenant |
| **Tenancy** | Single site | **Multi-tenant (backend ready)** | Multi-tenant + separate portals |
| **Theming** | One brand via CSS variables | One brand (per-tenant override ready) | Per-tenant theme from CMS |
| **Deploy** | Single nginx image | Multi-stage build → nginx | Containerized app + CMS + DB |

The site is now **progressively enhanced**: it works as a static site without the CMS, but when
the backend is available, it fetches and injects live content. The **design tokens**, **i18n hooks**,
and **section structure** remain the static fallback contract. The migration path is **non-breaking**
— see the [Roadmap](#roadmap-static--cms-driven-multi-tenant).

---

## Tech stack

**Current**

- **HTML5** — single page, semantic landmarks, `data-i18n*` hooks
- **CSS3** — custom properties (design tokens), Flexbox/Grid, logical properties for RTL, `clamp()` fluid type
- **Vanilla JavaScript (ES5-safe IIFE)** — no framework, no dependencies
- **Google Fonts** — Poppins, Inter (Latin) · Tajawal (Arabic)
- **Node.js** — lightweight build script for asset distribution
- **nginx (alpine)** + **Docker** for serving/packaging

The site now includes a **build layer** (`scripts/build.js`) that copies `index.html` and
`assets/` to a `dist/` folder for clean deployments. The Docker build uses a multi-stage
approach: `node:20-alpine` to run the build script, then `nginx:stable-alpine` to serve
the output.

---

## Quick start

### Prerequisites

- A modern browser. For local serving: **Node.js 18+**. For containers: **Docker**.
- Internet access (Google Fonts are loaded from a CDN).
- A local or remote instance of the **Payload CMS backend** running on `http://localhost:3000`
  (see [Dynamic Content Loading](#dynamic-content-loading) for API details).

### Run locally

**Static mode (no CMS required):**
```bash
# Install build dependencies
npm install

# Build static site to dist/
npm run build

# Serve from dist/ using Python or Node
cd dist && python -m http.server 5050     # → http://localhost:5050
# OR
npx serve dist                             # → http://localhost:3000
```

**Development with CMS (requires backend at `http://localhost:3000`):**

The page loads static fallback content by default. When the Payload CMS backend is running,
the frontend automatically fetches and injects CMS content:

```bash
# Build and serve
npm install
npm run build
npx serve dist   # → http://localhost:3000 (same port as backend; adjust CORS if needed)
```

Open your browser to `http://localhost:3000` and check the browser console for any API
fetch errors.

### Run with Docker

Multi-stage build (recommended for production):
```bash
docker compose up -d --build      # → http://localhost:8085
```

See [Build & deploy with Docker](#build--deploy-with-docker) for the full workflow.

---

## Dynamic Content Loading

The site fetches content from a **Payload CMS backend** using the `/api/v1/content` endpoint.
If the API is unavailable or a field is missing, the static HTML fallback is preserved
(strict fallback strategy).

### API Endpoint & Query Parameters

**Endpoint:** `http://<backend>/api/v1/content`

**Query Parameters:**
- `tenant` — tenant ID (numeric, e.g., `2`) or tenant slug (string, e.g., `dtc`)
- `slug` — page slug (e.g., `main-page`, `home`). If missing, defaults to `home`
- `type` — response shape: `all` (full page + tenant + layout), or section-specific
  (`hero`, `about`, `services`, `faqs`, `stats`, `cta`, `seo`, `branding`, `layout`)
  Default: `all`

**Example:**
```
http://localhost:3000/api/v1/content?tenant=2&slug=main-page&type=all
```

### Frontend Configuration

In [assets/js/main.js](assets/js/main.js), update the `API_ENDPOINT` constant to match your
backend and tenant:

```js
var API_ENDPOINT = 'http://localhost:3000/api/v1/content?tenant=2&slug=main-page';
```

- Replace `localhost:3000` with your actual backend URL (e.g., `https://api.example.com`).
- Replace `tenant=2` with your tenant ID or slug (contact the backend admin for the ID).
- Replace `slug=main-page` with the page slug you want to load.

**For multi-tenant setups:** Create a tenant-aware lookup or pass `tenant` from URL params:
```js
var params = new URLSearchParams(window.location.search);
var tenantId = params.get('tenant') || '2';
var pageSlug = params.get('slug') || 'main-page';
var API_ENDPOINT = 'http://localhost:3000/api/v1/content?tenant=' + tenantId + '&slug=' + pageSlug;
```

### Response Shape & Data Hydration

When type=`all`, the API returns:

```json
{
  "success": true,
  "data": {
    "tenant": {
      "name": "Dolf Training Center",
      "slug": "dtc",
      "domain": "example.com",
      "branding": {},
      "contactInfo": {}
    },
    "layout": {
      "header": {},
      "footer": {}
    },
    "page": {
      "title": "...",
      "slug": "main-page",
      "hero": {
        "titleEn": "Dolf Training Center",
        "titleAr": "مركز دلف للتدريب",
        "subtitleEn": "...",
        "subtitleAr": "...",
        "ctaTextEn": "...",
        "ctaUrl": "#programs"
      },
      "about": {
        "headingEn": "Who We Are?",
        "descriptionEn": "...",
        "additionalSections": [
          { "titleEn": "...", "contentEn": "..." }
        ]
      },
      "servicesContext": {
        "headingEn": "...",
        "servicesList": [...]
      },
      "faqsContext": {
        "headingEn": "...",
        "faqsList": [...]
      },
      "seo": {
        "metaTitleEn": "...",
        "metaDescriptionEn": "..."
      }
    }
  }
}
```

### Strict Fallback Strategy

The frontend only updates DOM elements **when the API returns non-empty values**:

- **Text fields** (hero title, about lead, etc.) are injected only if the API provides them.
- **Arrays** (FAQ items, service cards, additional sections) are rendered only if the list is
  non-empty. Static fallback markup remains if the array is empty or missing.
- **Missing or null fields** do not erase existing static content.
- **Language detection** uses `document.documentElement.lang` (`en` or `ar`) to pick the
  correct localized field (`*En` or `*Ar`).

**Example:** If the CMS has no FAQ items, the static FAQ accordion displays; if it has items,
the static FAQs are replaced with CMS data.

### Local Development vs. Production

| Environment | Backend URL | Tenant | Notes |
|---|---|---|---|
| **Local dev** | `http://localhost:3000` | `2` (or your tenant ID) | Backend must be running locally or accessible |
| **Staging** | `https://api-staging.example.com` | `2` | CORS must allow staging frontend origin |
| **Production** | `https://api.example.com` | `1` (or your tenant ID) | HTTPS required; update `API_ENDPOINT` in `main.js` before building |

**To deploy to production:**
1. Update `API_ENDPOINT` in `assets/js/main.js` to your live backend URL.
2. Run `npm run build`.
3. Rebuild the Docker image: `docker build -t dtc-website:latest .`
4. Push and deploy.

---

## Project structure

```
DTC/
├── index.html                  # The whole page. Sections carry data-i18n* hooks & stable IDs for hydration.
├── assets/
│   ├── css/
│   │   └── styles.css           # Design tokens (:root) + components + responsive + RTL
│   ├── js/
│   │   ├── i18n.js              # EN/AR dictionary — ALL static copy lives here
│   │   └── main.js              # i18n, nav, accordions, form validation, CMS content hydration
│   ├── img/                     # Photos (optimized; cut-outs are transparent PNG)
│   └── logo/                    # Brand lockups: EN / AR / stacked / mark (+ white)
│
├── package.json                # Build script & dev dependencies
├── scripts/
│   └── build.js                 # Copies index.html + assets/ to dist/
├── dist/                        # Build output (created by npm run build)
│
├── Dockerfile                  # Multi-stage: node:20-alpine → nginx:stable-alpine
├── nginx.conf                  # gzip, caching, UTF-8 charset, security headers, /healthz
├── docker-compose.yml          # One-command build + run (port 8085→80)
├── .dockerignore               # Excludes ~1.4 GB UI/ design sources from the build
│
├── Logo/                       # Original brand logo source files (PNG)
├── UI/                         # Original design source (.ai / .pdf) — NOT shipped
└── README.md
```

**Source of truth for static content:** `index.html` (English defaults) + `assets/js/i18n.js`
(EN & AR strings). **Source of truth for CMS content:** the `/api/v1/content` endpoint
(see [Dynamic Content Loading](#dynamic-content-loading)).
**Source of truth for look & feel:** the `:root` block in `assets/css/styles.css`.

---

## How it works

### Bilingual i18n (EN/AR + RTL)

All user-facing copy lives in **`assets/js/i18n.js`** as two dictionaries:

```js
window.TRANSLATIONS = {
  en: { "hero.subtitle": "Accredited Educational & Digital Expertise", /* … */ },
  ar: { "hero.subtitle": "خبرة تعليمية ورقمية معتمدة",                 /* … */ }
};
```

In the HTML, any element to be translated carries a hook:

| Attribute | Applies to | Example |
|---|---|---|
| `data-i18n="key"` | text content | `<span data-i18n="nav.home">Home</span>` |
| `data-i18n-html="key"` | rich text (inline markup allowed) | hero title with styled `<span>`s |
| `data-i18n-placeholder="key"` | input/textarea placeholder | form fields |

`assets/js/main.js` does the rest on load and on toggle:

1. Reads the saved language from `localStorage` (key **`dtc-lang`**), default `en`.
2. Sets `document.documentElement.lang` and `dir` (`ltr`/`rtl`).
3. Replaces every `data-i18n*` node from the active dictionary.
4. Updates `<title>` and the meta description, swaps the logo (EN/AR/mark).

**RTL is handled structurally**, not with a separate stylesheet: the CSS uses *logical
properties* (`margin-inline`, `inset-inline-*`, `padding-block`, …) so layout mirrors
automatically when `dir="rtl"`. Only a few `[dir="rtl"]` rules fine-tune directional
icons (arrows) and asymmetric shapes.

**To edit copy:** change the matching `en`/`ar` strings in `i18n.js`. **To add a string:**
add the key to *both* dictionaries and reference it with `data-i18n` in the HTML.
**To add a language:** add a third dictionary (e.g. `fr`) and a toggle option (see
[Per-tenant i18n](#per-tenant-i18n--adding-locales)).

### Theming & design tokens

Every color, font, radius, shadow and spacing value is a **CSS custom property** declared
once at the top of `styles.css`:

```css
:root {
  --brand: #0055e2;
  --brand-grad: linear-gradient(135deg, #2a7bff 0%, #0a57e0 45%, #0034a8 100%);
  --ink: #0c1424;          /* headings / dark sections */
  --text: #4a5468;         /* body copy */
  --surface: #f4f6f9;      /* light cards */
  --f-display: 'Poppins', sans-serif;
  --f-body: 'Inter', sans-serif;
  --r-lg: 26px; --r-xl: 40px; --pill: 999px;
  /* …shadows, container width, easings… */
}
html[lang="ar"] { --f-display: 'Tajawal'; --f-body: 'Tajawal'; }
```

This is the single most important seam for **multi-tenant theming**: a tenant's brand can
be applied by overriding these variables at runtime (see
[Per-tenant theming](#per-tenant-theming)). Re-theming the whole site is a matter of
changing `:root` — no component edits required.

### Components & sections

The page is one document composed of standalone sections, each with an `id` used by the
nav and scroll-spy:

`#home` (hero) · quick-link cards · `#about` (Who We Are) · `#programs` (Training Programs)
· `#solutions` (Services for Organizations) · `#faqs` · `#contact` · footer.

Class naming is **BEM-ish** (`.block`, `.block__element`, `.block--modifier`), e.g.
`.program`, `.program__title`, `.qcard--primary`. Components are self-contained — copying a
section's markup + its CSS block is enough to reuse it.

### JavaScript behavior

`main.js` is a single IIFE (no globals leaked beyond `window.TRANSLATIONS`) wiring:

- Language switch (+ persistence)
- Sticky/condensing header on scroll
- Mobile off-canvas nav drawer + collapsible submenu
- Accordions (Who We Are, FAQ) — single-open per group
- Training-program expander (hover on desktop, tap on touch)
- Contact form **client-side validation** + success state
- Scroll-reveal animations via `IntersectionObserver`
- Scroll-spy active nav link, back-to-top button

It is dependency-free and defensive (feature-detects `IntersectionObserver`,
`localStorage`, `scrollRestoration`).

### Accessibility & performance

- Semantic HTML, skip-link, `aria-expanded`/labels on interactive widgets, keyboard-operable.
- Honors `prefers-reduced-motion`.
- Optimized images, `loading="lazy"` below the fold, `IntersectionObserver` reveals.
- nginx serves gzip + long-cache for assets and `charset=utf-8` (correct Arabic).

---

## Content reference (CMS-ready inventory)

This is the **content contract** the CMS will populate. Each current section maps cleanly
to a content type — use this when modeling collections.

| Section | Suggested CMS content type | Fields (each localized EN/AR) |
|---|---|---|
| Site/global | `Settings` (singleton, per tenant) | brand name, logo set, phone, email, address, social links, default locale, theme tokens |
| Navigation | `NavItem[]` | label, target/anchor, order, children |
| Hero (`#home`) | `Page.hero` block | eyebrow, title (rich), subtitle, body, CTA buttons[], image |
| Quick cards | `ShortcutCard[]` | title, subtitle, link, style (primary/dark/default) |
| Who We Are (`#about`) | `Page.about` + `Value[]` | lead text, vision, message, **values[]** (name + description) |
| Training Programs (`#programs`) | `Program[]` | title, description, image, icon, order, accreditation note |
| Services (`#solutions`) | `Page.solutions` block | heading, lead, **bullets[]**, CTA, image |
| FAQs (`#faqs`) | `Faq[]` | question, answer, order |
| Contact (`#contact`) | `Page.contact` + form config | heading, lead, phone, email, address, map URL, form fields, recipient |
| Footer | `Settings.footer` | social links, partner logo, "powered by", copyright |

Every text field is **bilingual** today (EN/AR) and should be modeled as a localized field
in the CMS.

---

## Build & deploy with Docker

The site ships as a tiny **nginx:stable-alpine** image. The Docker build uses a **multi-stage
approach**: `node:20-alpine` runs the build script to generate `dist/`, then `nginx:stable-alpine`
serves the output. This keeps the final image clean (~40 MB total; ~1–2 MB is the actual site).

gzip, asset caching, UTF-8 and security headers are configured in [`nginx.conf`](nginx.conf).

> [`.dockerignore`](.dockerignore) keeps the build context small by excluding the
> ~1.4 GB `UI/` design sources, `Logo/`, and docs. Only `index.html` + `assets/` are copied
> into the builder stage, then the output is copied to nginx.

### Build & run

```bash
# Build the image (multi-stage: build → nginx)
docker build -t dtc-website:latest .

# Run the container
docker run -d --name dtc-website -p 8085:80 dtc-website:latest   # http://localhost:8085
docker rm -f dtc-website                                          # stop & remove

# Docker Compose (builds + runs in one command)
docker compose up -d --build      # build + start, → http://localhost:8085
docker compose down               # stop
```

### Health & ports

- Listens on **port 80** inside the container.
- Published as **port 8085** locally (see `docker-compose.yml`).
- Health endpoint **`/healthz`** → `ok`; image has a built-in `HEALTHCHECK`
  (`docker ps` shows `healthy`).

### Push to a registry & deploy

```bash
docker tag dtc-website:latest <registry>/<namespace>/dtc-website:1.0.0
docker push                    <registry>/<namespace>/dtc-website:1.0.0

docker run -d -p 80:80 --restart unless-stopped \
  --name dtc-website <registry>/<namespace>/dtc-website:1.0.0
```

For HTTPS, front the container with a reverse proxy / ingress (Traefik, Caddy, nginx, an
ALB, or Cloudflare) and terminate TLS there. For cloud/ARM hosts, do a multi-arch build:
`docker buildx build --platform linux/amd64,linux/arm64 -t … --push .`

---

## Roadmap: static → CMS-driven, multi-tenant

Goal: serve **many training centers/brands ("tenants")** from one codebase, each with its
own content, languages, theme and (optionally) domain — all editable through a CMS.

### Target architecture

```
                         ┌──────────────────────────┐
   request               │  Edge / Reverse proxy     │  TLS, routing by host/path
  (tenant domain)  ─────▶ │  (Traefik / nginx / CF)   │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │  Web app (SSR)            │  resolves tenant → fetches content
                         │  Next.js / Nuxt / Astro   │  → renders existing sections/tokens
                         └─────┬───────────────┬─────┘
                               │               │
                  ┌────────────▼───┐     ┌─────▼───────────────┐
                  │ Headless CMS   │     │ Database            │  tenants, content,
                  │ Strapi/Directus│     │ (Postgres)          │  users, translations
                  │ /Payload       │     └─────────────────────┘
                  └───────┬────────┘
                          │
                   ┌──────▼──────┐
                   │ Media / CDN │  images, logos
                   └─────────────┘
```

The **current `index.html` + `styles.css` become the rendering template**: sections stay
the same, but their text/images come from the CMS and the `:root` tokens come from the
tenant's theme.

### Multi-tenancy

**1) Tenant resolution** — pick how a request maps to a tenant:

| Strategy | Example | Notes |
|---|---|---|
| Subdomain | `riyadh.dtc.app` | Clean; wildcard DNS + wildcard TLS |
| Path prefix | `dtc.app/riyadh` | Simplest; no DNS work |
| Custom domain | `academy.example.com` | Best UX; per-tenant cert (e.g. via Caddy/ACME) |

Resolve early (middleware), attach `tenant` to the request context:

```js
// pseudo-middleware
const host = req.headers.host;                 // or req.path segment
const tenant = await tenants.findByHost(host); // cache this lookup
if (!tenant) return res.status(404);
req.tenant = tenant;                            // id, locales, theme, domain
```

**2) Data isolation** — choose per requirements:

| Model | Isolation | Ops cost | Good for |
|---|---|---|---|
| Shared DB, `tenant_id` column (+ row-level security) | Logical | Low | Most SaaS; start here |
| Schema-per-tenant | Strong | Medium | Stricter separation |
| Database-per-tenant | Strongest | High | Enterprise/regulated |

**Recommendation:** start with **shared DB + `tenant_id` + Postgres Row-Level Security**.
Every content query is scoped by `tenant_id`; enforce it at the data layer, never trust
the client.

**3) Per-tenant config** — a `tenants` record drives everything:

```jsonc
{
  "id": "riyadh",
  "name": "DTC Riyadh",
  "domains": ["riyadh.dtc.app", "academy.example.com"],
  "locales": ["ar", "en"],
  "defaultLocale": "ar",
  "theme": { "brand": "#0055e2", "ink": "#0c1424", "fontDisplay": "Poppins" },
  "contact": { "phone": "+966 548 16 1616", "email": "info@dolftech.com" }
}
```

### Per-tenant theming

Because the design is **100% driven by CSS custom properties**, theming a tenant is just
emitting an override block per request — no component changes:

```html
<!-- server injects the tenant's tokens into <head> -->
<style id="tenant-theme">
  :root {
    --brand: {{ tenant.theme.brand }};
    --ink:   {{ tenant.theme.ink }};
    --f-display: '{{ tenant.theme.fontDisplay }}', sans-serif;
  }
</style>
```

Store a small, **validated** set of token overrides per tenant (allowlist the variables
that may be themed). Logos/images come from the tenant's media library.

### Per-tenant i18n / adding locales

- Today: two in-file dictionaries (`en`, `ar`). Tomorrow: **CMS-managed translations**,
  with the active locale resolved from the tenant's `locales` + the URL (`/ar/…`, `/en/…`)
  or `Accept-Language`.
- Keep the **same key namespace** (`hero.title`, `program.business`, …) so the existing
  `data-i18n` template keeps working — only the *source* of strings changes (file → API).
- Adding a language = add a locale to the tenant + provide translations for the key set.
  RTL/LTR is already automatic from `dir`.

### Recommended stack options

Not prescriptive — pick per team familiarity:

- **Framework (SSR + i18n + theming):** Next.js, Nuxt, or Astro. All support per-request
  tenant resolution, localized routing, and injecting the theme `<style>` block.
- **Headless CMS:** Directus or Strapi (DB-backed, good i18n + roles), or Payload (TypeScript).
  Model the [content types above](#content-reference-cms-ready-inventory); enable
  localization and a `tenant` relation on each collection.
- **Database:** PostgreSQL (RLS for tenant isolation).
- **Auth/roles:** CMS-native roles, or an IdP (Keycloak/Auth0) for admin & tenant users.
- **Media:** CMS media library backed by S3-compatible storage + CDN.
- **Contact form:** real endpoint (CMS form handler, serverless function, or service like
  Formspree) with spam protection.

### Phased migration plan

1. **Externalize content** — move `i18n.js` strings + image refs into JSON files matching
   the [content model](#content-reference-cms-ready-inventory). Front-end fetches them.
   *(No CMS yet — proves the content contract.)*
2. **Introduce SSR** — port `index.html` into a framework template that renders the same
   sections from that JSON. Keep CSS/tokens as-is.
3. **Add the CMS** — replace JSON files with CMS APIs; wire localization + media.
4. **Add tenancy** — `tenants` table, request resolution, `tenant_id` scoping (+ RLS),
   per-tenant theme `<style>` injection.
5. **Self-service** — admin UI for tenants to edit content, theme, languages; custom domains + TLS.
6. **Harden** — caching/ISR, rate limits, backups, observability, CI/CD per environment.

Each phase ships independently and keeps the site live.

---

## Coding standards & conventions

- **No hard-coded user-facing strings in markup logic** — everything goes through the
  i18n dictionary (keeps the CMS migration clean).
- **No hard-coded colors/sizes in components** — use the `:root` tokens (keeps theming clean).
- **Use logical CSS properties** (`*-inline`, `*-block`) so RTL keeps working for free.
- **BEM-ish class names**; one component = one CSS block.
- Keep JS framework-free until the SSR phase; feature-detect browser APIs.
- Optimize and right-size images; prefer transparent PNG only for cut-outs, JPEG for photos.
- Run an HTML/CSS/JS formatter before committing; keep `index.html` readable (it's the template).

---

## Brand reference

| | Value |
|---|---|
| Primary blue | `#0055e2` → gradient `#2a7bff → #0034a8` |
| Ink / dark | `#0c1424` |
| Fonts (EN) | Poppins (display), Inter (body) |
| Font (AR) | Tajawal |
| Phone | **+966 548 16 1616** |
| Email | **info@dolftech.com** |
| Logos | `assets/logo/` — `logo-en`, `logo-ar`, `logo-stacked`, `logo-mark` (+ white variants) |

Logos were produced as transparent PNGs from the original sources in `Logo/`. The full
design lives in `UI/` (Adobe Illustrator + PDF) — kept in the repo for reference but
**excluded from the Docker image**.

---

## Known limitations / TODO

- **Contact form is front-end only** — it validates and shows a success message but does
  not submit anywhere. Wire it to a backend/service (see [stack options](#recommended-stack-options)).
- Single tenant, content hard-coded in HTML + `i18n.js` (the [roadmap](#roadmap-static--cms-driven-multi-tenant) addresses this).
- Google Fonts load from CDN — self-host for offline/air-gapped deployments or stricter CSP.
- No automated tests yet — add unit tests for i18n/validation and E2E (Playwright) once SSR lands.
- Add a `favicon.ico`/app-icon set and a `sitemap.xml`/`robots.txt` for production SEO.

---

*Built for Dolf Training Center — مركز دلف للتدريب · powered by Dolf Technologies.*
