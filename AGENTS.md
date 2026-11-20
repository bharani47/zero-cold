# ZeroCold — Agent Context Guide

> **Team:** Code Ruptors | **Event:** Startup Buildathon India 2026 (Google DeepMind × Google Cloud)

## What This Project Is

ZeroCold is a **B2B outbound intelligence SaaS** designed for solo web/SEO freelancers and digital marketing agencies. It automates manual prospect discovery and generic cold emailing by:

1. **Extracting real public digital footprint signals** (server-side via cheerio + native fetch with 6s timeout)
2. **Scoring lead urgency and conversion potential** using an ML logistic regression model
3. **Running an orchestrated 3-agent Gemini pipeline**: Analyst (Flash) → Writer (Pro) → Critic (Flash)
4. **Providing a human-in-the-loop approval gate** with live draft editing and Firestore synchronization
5. **Presenting findings in a high-density, enterprise dark-mode dashboard** with glassmorphism and spring micro-interactions

---

## Repository Structure

```
zerocold/
├── src/
│   ├── app/
│   │   ├── api/audit/route.ts   # POST /api/audit — 5-step Gemini & ML intelligence pipeline
│   │   ├── globals.css          # Design system, CSS variables, glassmorphism, spring keyframes
│   │   ├── layout.tsx           # Root layout with local Geist fonts & viewport configuration
│   │   └── page.tsx             # Main client dashboard (Search, Command Bar, Split Workspace)
│   ├── components/
│   │   ├── AnalystPanel.tsx     # Gemini Analyst verified gap findings & competitor benchmark
│   │   ├── ApprovalBox.tsx      # Human-in-the-loop approval, edit pitch, copy, revert & reject
│   │   ├── AuthButton.tsx       # Firebase Google sign-in with avatar & signout
│   │   ├── CriticPanel.tsx      # Gemini Critic groundedness audit & draft vs revision view
│   │   ├── KpiCard.tsx          # High-impact metric card with glass surface & shimmer
│   │   ├── PipelineStepper.tsx  # 5-step live pipeline stepper with latency & model tags
│   │   ├── ProspectCard.tsx     # Prospect queue card with ML score bar & audit status
│   │   ├── SiteSignalsPanel.tsx # 6-point digital footprint verification badges & score factors
│   │   └── StatusPill.tsx       # Semantic status/priority badge
│   ├── data/
│   │   └── seedLeads.ts         # 10 seeded Chennai prospect records (including pre-audited demos)
│   ├── lib/
│   │   ├── firebase.ts          # Firebase app/auth/Firestore client init with SSR guards
│   │   ├── leadScorer.ts        # Logistic regression lead scorer with exported Colab weights
│   │   └── siteAnalyzer.ts      # Server-side SEO & signal extractor (cheerio + fetch)
│   └── types/
│       └── audit.ts             # Shared TypeScript interfaces & payload schemas
├── public/
│   ├── fonts/                   # Local Geist Sans & Mono woff2 font files
│   └── zerocold-logo.jpg        # Official ZeroCold wordmark & icon asset
├── .env.local.example           # Required environment variables template
├── AGENTS.md                    # ← You are here
└── README.md                    # Project documentation & setup guide
```

---

## Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.4 App Router + TypeScript | High-performance server rendering & static optimization |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Custom Properties | Linear/Vercel enterprise aesthetic, glassmorphism, spring curves |
| **AI Models** | `@google/genai` v3.6.1 (`GoogleGenAI`) | Gemini 2.5 Flash (Analyst & Critic) + Gemini 2.5 Pro (Writer) |
| **Database & Auth** | Firebase v13 (Client SDK) | Google OAuth & Cloud Firestore live real-time synchronization |
| **HTML Scraping** | cheerio v1 + native `fetch` | Server-side DOM analysis & mobile/SEO/tag verification |
| **Typography** | Local Geist Sans & Geist Mono | Zero network dependency font rendering via `next/font/local` |
| **Icons** | lucide-react | Consistent vector icon system |

---

## Environment Variables

Copy `.env.local.example` → `.env.local` and configure:

```bash
# Gemini API Key (from Google AI Studio)
GEMINI_API_KEY=AIzaSy...
GEMINI_FLASH_MODEL=gemini-2.5-flash   # Analyst & Critic agents
GEMINI_PRO_MODEL=gemini-2.5-pro       # Writer agent

# Firebase Client Configuration (Optional for offline demo)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zerocold-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zerocold-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zerocold-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
```

---

## Coding Rules & Constraints for AI Agents

### Next.js 16 App Router
- Default to Server Components; declare `"use client"` only for interactive client trees.
- API Route handlers live at `src/app/api/<name>/route.ts` exporting HTTP verb functions (`POST`, `GET`).
- Never use legacy Pages Router APIs (`getServerSideProps`, `getStaticProps`, `router.push` from `next/router`).
- Fonts are loaded locally from `public/fonts/` using `next/font/local` to comply with sandbox restrictions.

### `@google/genai` SDK (v3)
- Top-level import: `import { GoogleGenAI, Type } from "@google/genai"`
- Direct model invocation: `ai.models.generateContent({ model, contents, config })`
- Structured JSON outputs:
  ```ts
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: { ... },
      required: [ ... ]
    }
  }
  ```
- Always parse `response.text` as JSON; do not access `.candidates` directly.

### Firebase (v13 Client SDK)
- Client-side only — no Firebase Admin SDK.
- `src/lib/firebase.ts` guards against missing env vars and SSR (`typeof window !== "undefined"`).
- Always wrap Firestore calls in `try/catch` and ensure the frontend maintains local React state so features continue functioning gracefully without active Firebase credentials.

### Design System & Visual Hierarchy
- Deep void background (`#07070a`) with 3-tier radial blue illumination.
- Glassmorphism: `.glass` (`16px` blur) and `.glass-lg` (`24px` blur) with subtle alpha borders (`rgba(255,255,255,0.07)`).
- Single accent color: `#2563eb` (Royal Blue) transitioning to `#3b82f6` on hover.
- Semantic indicators: Emerald for approved/high priority, Amber for pending/medium, Rose for rejected/low priority.
- No glowing neon box-shadows or distracting looping animations. Micro-interactions use cubic-bezier spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## The 5-Step Intelligence Pipeline (`POST /api/audit`)

```
Input: { businessName, niche, city, websiteUrl, googleRating, reviewCount, senderOffer }
                         │
Step 1: Signal Extraction (cheerio + Google PageSpeed Insights API in parallel)
        → Extracts reachable, responseTime, HTTPS, meta description,
          mobile viewport, h1 count, analytics pixel, booking CTA, schema.
        → Extracts Core Web Vitals: mobilePerformanceScore, seoScore, lcpMs (5s timeout).
                         │
Step 2: ML Lead Scorer (BigQuery ML Logistic Regression)
        → Computes 0–100 lead score, Priority Tier, and top 3 factor contributions.
        → BQML formula: ratingNorm = (rating - 3)/2, reviewsNorm = min(reviews/200, 1.0).
                         │
Step 3: Analyst Agent (Gemini Flash · Structured JSON)
        → Evaluates site signals and Core Web Vitals against dynamic local market competitors.
        → Returns digitalGapScore, verifiedGaps[], competitorBenchmark, recommendedAngle.
                         │
Step 4: Writer Agent (Gemini Pro · Structured JSON)
        → Crafts multi-channel outreach pack in a single call:
          - Initial Cold Email (< 100 words, anchored to verified gap)
          - 48h Competitor Follow-Up (< 70 words)
          - WhatsApp / LinkedIn DM (< 45 words)
        → Bans sales clichés ("hope this finds you well", "synergy", "game-changer").
                         │
Step 5: Critic Agent (Gemini Flash · Structured JSON)
        → Verifies every factual claim against extracted raw DOM signals.
        → Scores groundedness (0–100), outputs verification checks, and produces revised final copies.
                         │
Output: Full AuditResult payload with stage-by-stage latencies & model metadata.
```

---

## Omni-Channel Outreach & Public Reports

- **3-Channel Tabbed Interface (`ApprovalBox.tsx`)**: Switch between Cold Email, 48h Follow-Up, and WhatsApp/LinkedIn DM with 1-click clipboard copy, word count tracker, and revert controls.
- **Client-Facing White-Label Audit Reports (`/audit/[id]`)**: Instant public shareable link showing the prospect's digital health score gauge, Core Web Vitals, verified gaps, competitor benchmarks, and "Book a Strategy Call" CTA.
- **Rate Limiting & Execution**: Protected with `export const maxDuration = 60` for Vercel functions, 4000ms scraping timeout, and 20 audits/hour in-memory IP rate limiter.

---

## ML Lead Scoring (`src/lib/leadScorer.ts`)

Powered by **Google Cloud BigQuery ML** (`zerocold-a4b76.zerocold_analytics.lead_scorer_bqml`).

Model Performance:
- **Accuracy**: 97.69%
- **ROC-AUC**: 0.9969
- **Precision**: 96.84%
- **F1 Score**: 96.34%
- **Log Loss**: 0.077

Logistic regression scoring formula:
$$\sigma(z) = \frac{1}{1 + e^{-z}}, \quad z = \text{bias} + \sum w_i x_i$$

Features & Weights:
- `intercept`: `-0.4959`
- `hasWebsite`: `-4.6101`
- `hasHttps`: `-2.4166`
- `hasMetaDescription`: `-1.3974`
- `hasViewportMeta`: `-2.6847`
- `hasBookingCta`: `-2.6554`
- `hasSchemaMarkup`: `-1.8378`
- `ratingNorm`: `+3.6292` (normalized: `(googleRating - 3.0) / 2.0`)
- `reviewsNorm`: `+4.5331` (normalized: `Math.min(reviewCount / 200, 1.0)`)

Weights and evaluation metrics are exported in `MODEL_METADATA` and `MODEL_WEIGHTS` in `src/lib/leadScorer.ts`.

---

## Developer Verification Workflow

Before committing changes, always run the full validation chain:

```bash
# 1. ESLint check (must pass with 0 errors, 0 warnings)
npm run lint

# 2. Production build compilation
npm run build
```
