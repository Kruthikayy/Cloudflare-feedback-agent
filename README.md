# Cloudflare Feedback Agent

AI-powered feedback intelligence tool built on **Cloudflare Workers**, **D1**, and **Workers AI**.

## What it does
- Collects product/user feedback (via UI or API)
- Stores feedback in Cloudflare **D1**
- Uses **Workers AI** to classify / summarize / extract themes
- (Optional) Shows a dashboard / results UI

## Demo
- Live URL: <ADD_DEPLOYED_URL_HERE>
- Screenshots: <ADD_1-2_SCREENSHOTS_OR_GIF_HERE>

## Features
- ✅ Feedback ingestion (form / endpoint)
- ✅ Persistent storage with D1
- ✅ AI summaries + tagging (sentiment, topic, priority, etc.)
- ✅ Search/filter (if you have it)
- ✅ Tests (if you have them)

## Tech Stack
- Cloudflare Workers
- Cloudflare D1 (SQLite)
- Cloudflare Workers AI
- Vite (if used) / Static assets in `public/` (if true)

## Project Structure
```txt
src/            # Worker code / API routes
public/         # Static frontend assets (if any)
migrations/     # D1 migrations
test/           # tests
wrangler.jsonc  # Cloudflare config

