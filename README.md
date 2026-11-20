# ZeroCold

> **B2B Outbound Intelligence SaaS** — Built for Startup Buildathon India 2026 (Google DeepMind × Google Cloud)  
> Team: **Code Ruptors** | Stack: Next.js 16 App Router · Gemini 2.5 Flash & Pro · Firebase · Tailwind CSS

ZeroCold replaces manual B2B prospecting and generic, spammy cold outreach for solo web/SEO freelancers and digital marketing agencies. It inspects a local business's real public digital footprint, scores their buying urgency with a machine learning model, orchestrates a 3-agent Gemini intelligence pipeline, and delivers an evidence-backed, human-approved outreach draft into a sleek, enterprise dashboard.

---

## ⚡ The Core Problem ZeroCold Solves

1. **Generic Cold Email Fails**: 98% of B2B cold emails get ignored because they use spray-and-pray generic templates (*"I can help elevate your brand"*).
2. **Manual Prospecting Takes Hours**: Agencies spend 30–45 minutes per lead manually inspecting websites, checking mobile responsiveness, finding broken meta tags, and checking reviews.
3. **AI Hallucinations Kill Trust**: Standard AI email tools invent fake facts about a prospect's company that immediately destroy credibility.
4. **ZeroCold's Solution**: ZeroCold automates real technical signal extraction, grounds every argument in verified DOM facts, audits the pitch with a dedicated Critic agent, and puts the human in control to approve or edit with one click.

---

## 🚀 The 5-Step Intelligence Pipeline

```
                       POST /api/audit
                             │
                  ┌──────────▼──────────┐
                  │ 1. Signal Extractor │  cheerio (4s) + Google PageSpeed Insights (5s)
                  │ 2. ML Lead Scorer   │  BigQuery ML logistic regression (0–100)
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │  3. Analyst Agent   │  Gemini Flash
                  │  (Structured JSON)  │  gaps + Core Web Vitals + competitor benchmark
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │   4. Writer Agent   │  Gemini Pro
                  │  (Structured JSON)  │  omni-channel pack: email, 48h nudge, DM
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │   5. Critic Agent   │  Gemini Flash
                  │  (Structured JSON)  │  fact verification + groundedness check
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │ Dashboard Approval  │  Omni-channel 3-tab review & copy
                  │ Public Client Link  │  Shareable report (/audit/[id])
                  │ Firestore live sync │  approve / copy / revert / reject
                  └─────────────────────┘
```

| Step | Engine | Functionality |
|---|---|---|
| **1. Signal Extractor** | cheerio v1 + Google PageSpeed API | Inspects live URL (4s timeout): HTTPS, mobile viewport, meta description, booking/WhatsApp CTAs, schema markup, and analytics pixels, plus mobile Core Web Vitals (Performance, SEO, LCP) with 5s timeout. |
| **2. ML Lead Scorer** | BigQuery ML Logistic Regression | Predicts buying urgency (0–100), assigns priority tiers (`High`, `Medium`, `Low`), and explains the top 3 positive/negative factor contributions using exact BQML model normalization. |
| **3. Analyst Agent** | Gemini Flash | Compares extracted signals and PageSpeed metrics against dynamic local rivals. Returns digital gap score, categorized gaps, exact evidence, business impact, and recommended angle. |
| **4. Writer Agent** | Gemini Pro | Crafts an omni-channel outreach pack in a single call: Initial Cold Email (< 100 words), 48h Competitor Follow-Up (< 70 words), and WhatsApp/LinkedIn DM (< 45 words). Explicitly bans sales clichés. |
| **5. Critic Agent** | Gemini Flash | Cross-references every claim against raw scraped DOM data, scores groundedness (0–100), flags hallucinated statements, and produces revised final versions across all channels. |
| **Omni-Channel Approval Gate** | Dashboard & Cloud Firestore | 3-tab outreach switcher (Cold Email, 48h Follow-Up, WhatsApp/LinkedIn), 1-click Copy, "Copy Client Report Link" to public white-label report (`/audit/[id]`), word counters, Approve & Save, and Reject. |

---

## 🎨 Enterprise Design System

- **Color Palette**: Deep void `#07070a` background with 3-tier radial blue illumination; single primary accent `#2563eb` (Royal Blue) transitioning to `#3b82f6` on hover.
- **Glassmorphism**: Layered `.glass` (`16px` blur) and `.glass-lg` (`24px` blur) cards with subtle `rgba(255,255,255,0.07)` borders.
- **Micro-Interactions**: Smooth cubic-bezier spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`) without neon glow or distracting looping pulses.
- **Typography**: Local Geist Sans and Geist Mono woff2 fonts loaded directly with `next/font/local`.
- **Search & Filter**: Real-time client-side omnibar search across prospect business names, niches, and cities.
- **Keyboard Shortcuts**: Full Enter key submission across all Command Bar inputs.

---

## 📁 Repository Structure

```
zerocold/
├── src/
│   ├── app/
│   │   ├── api/audit/route.ts   # Multi-agent Gemini audit route
│   │   ├── audit/[id]/page.tsx  # Shareable white-label public report route
│   │   ├── globals.css          # Design system & CSS keyframes
│   │   ├── layout.tsx           # Root layout & local fonts
│   │   └── page.tsx             # Main dashboard client component
│   ├── components/
│   │   ├── AnalystPanel.tsx     # Verified digital gaps & competitor benchmark
│   │   ├── ApprovalBox.tsx      # Human approval, edit pitch, copy, revert & reject
│   │   ├── AuthButton.tsx       # Firebase Google sign-in with user avatar
│   │   ├── CriticPanel.tsx      # Groundedness score & draft comparison
│   │   ├── KpiCard.tsx          # High-impact metric card with glass surface
│   │   ├── PipelineStepper.tsx  # 5-step live pipeline stepper with latency tags
│   │   ├── ProspectCard.tsx     # Prospect queue card with ML score bar
│   │   ├── SiteSignalsPanel.tsx # 6-point digital footprint verification badges
│   │   └── StatusPill.tsx       # Semantic status/priority badge
│   ├── data/
│   │   └── seedLeads.ts         # 10 seeded Chennai prospect records (with demo audits)
│   ├── lib/
│   │   ├── firebase.ts          # Firebase app/auth/Firestore client init
│   │   ├── leadScorer.ts        # Logistic regression ML scorer
│   │   └── siteAnalyzer.ts      # Server-side website signal extractor
│   └── types/
│       └── audit.ts             # Shared TypeScript interfaces
├── public/
│   ├── fonts/                   # Local Geist Sans & Mono woff2 files
│   └── zerocold-logo.jpg        # Official brand logo
├── .env.local.example           # Environment variables template
├── AGENTS.md                    # Developer & AI Agent Context Guide
└── README.md                    # You are here
```

---

## 🛠 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm** or **pnpm**
- **Google AI Studio Key**: [aistudio.google.com](https://aistudio.google.com)

### 2. Installation

```bash
git clone https://github.com/CodeRuptors/zerocold.git
cd zerocold
npm install
```

### 3. Environment Setup

Create `.env.local` from the example template:

```bash
cp .env.local.example .env.local
```

Fill in your configuration:

```bash
# Gemini Models (Google DeepMind)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro

# Firebase Client SDK (Optional for offline demo)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Lint Verification

```bash
# Verify ESLint (0 errors, 0 warnings)
npm run lint

# Compile optimized production build
npm run build

# Start production server
npm start
```

---

## 🧪 Instant Demo Mode (No Firebase Required)

ZeroCold includes built-in offline resilience:
- The app immediately loads 10 realistic seeded Chennai prospects (clinics, salons, gyms, cafes across Adyar, Anna Nagar, T. Nagar, Velachery).
- Includes pre-audited intelligence payloads for **Dr. Priya Dental Clinic** and **Studio Zara – Ladies Salon** so judges and evaluators can immediately test the approval gate, draft comparisons, and KPI calculations without waiting for API keys.
- If Firebase environment variables are omitted, all lead status changes, approvals, and audits function in local React state without throwing runtime errors.

---

## 🤖 Google Cloud BigQuery ML Scoring Model

The predictive lead scoring model runs on weights trained directly via **Google Cloud BigQuery ML**:
- **BQML Model**: `zerocold-a4b76.zerocold_analytics.lead_scorer_bqml`
- **Validation Metrics**:
  - Accuracy: **97.69%**
  - ROC-AUC: **0.9969**
  - Precision: **96.84%**
  - F1 Score: **96.34%**
  - Log Loss: **0.077**

Weights configuration:
```json
{
  "intercept": -0.4959,
  "weights": {
    "hasWebsite": -4.6101,
    "hasHttps": -2.4166,
    "hasMetaDescription": -1.3974,
    "hasViewportMeta": -2.6847,
    "hasBookingCta": -2.6554,
    "hasSchemaMarkup": -1.8378,
    "ratingNorm": 3.6292,
    "reviewsNorm": 4.5331
  }
}
```

The feature weights and evaluation metrics are exported in `MODEL_METADATA` in `src/lib/leadScorer.ts`.

---

## 👥 Team: Code Ruptors

Built for **Startup Buildathon India 2026** organized by **Google DeepMind × Google Cloud**.

---

## 📄 License

MIT License — see LICENSE for details.
