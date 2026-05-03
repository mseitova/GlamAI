# GlamAI

> AI-driven personal color analysis web application — find your seasonal color type and get a tailored palette for clothing and makeup.

---

## Overview

GlamAI helps users determine their seasonal color type using the **12-season system** (Bright Spring, True Autumn, Cool Summer, etc.). The user uploads a facial photo and answers a short questionnaire; GPT-4o returns a structured analysis including seasonal type, undertone, contrast, saturation, a 12-color recommended palette, 6 colors to avoid, metal recommendations, and makeup suggestions.

**Key features:**
- 🎨 12-season AI color classification (via GPT-4o multimodal vision)
- 💄 Virtual makeup try-on (MediaPipe face landmarks, client-side)
- 🖼️ Color drape overlay on user photo
- 🤖 AI consultant chat (analysis-aware context)
- 👗 Outfit combo generator
- 📱 Instagram story export (1080×1920 PNG)
- 💾 Analysis archive (browser localStorage)
- 📲 Installable PWA — no account required
- 📨 Human stylist request form with Slack/Telegram webhook

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| UI | React 18 + TypeScript 5.5 (strict) |
| Styling | Tailwind CSS 3.4 |
| Animations | Framer Motion 12 |
| Computer Vision | MediaPipe Tasks Vision 0.10 |
| AI Provider | OpenAI SDK 4.55 — GPT-4o |
| Persistence (current) | Browser localStorage |
| Persistence (planned) | Supabase / PostgreSQL |
| Deployment | Vercel |

---

## Architecture

The application is a single Next.js codebase covering the React client, API routes, and edge endpoints. No separate backend service is required.

### API Routes
- `POST /api/analyze` — multimodal color analysis via GPT-4o
- `POST /api/chat` — analysis-aware AI consultant
- `POST /api/combo` — outfit suggestions
- `POST /api/expert` — human stylist request with optional webhook

### Client-side
- MediaPipe runs entirely in the browser for <100ms landmark detection
- localStorage persistence with UUID keys, JPEG thumbnails, and LRU eviction

### Planned: Supabase
Schema prepared in `supabase/migrations/0001_init.sql` — includes auth, analyses, chat messages, expert requests, photo storage bucket, RLS policies, and 30-day retention via `pg_cron`.

---

## Getting Started

```bash
git clone https://github.com/mseitova/GlamAI.git
cd GlamAI
npm install
```

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Survey Results

A validation survey (n=52) showed:
- **67%** ready to use GlamAI
- **31%** Maybe
- **2%** No

No statistically significant difference in interest across user roles (χ² = 4.46, p = 0.814) — interest is broadly distributed across consumers, makeup artists, and beauty professionals.

---

## Competitive Position

| Feature | GlamAI | YouCam Makeup | Perfect Corp | Colorwise.me |
|---|---|---|---|---|
| 12-season AI classification | ✅ | ❌ | Partial | Semi-manual |
| Brand-agnostic recommendations | ✅ | ❌ | ❌ | ✅ |
| Makeup + clothing palettes | ✅ | ❌ | ❌ | Clothing only |
| AR try-on | Roadmap | ✅ | ✅ | ❌ |
| No account required | ✅ | ❌ | ❌ | ✅ |
| Web + Mobile PWA | ✅ | Mobile only | Web (embedded) | Web only |

---

## License

MIT
