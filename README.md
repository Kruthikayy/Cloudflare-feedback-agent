# Cloudflare Feedback Agent

AI-powered feedback intelligence tool built on **Cloudflare Workers**, **D1**, and **Workers AI**.

## What it does
- Collects product/user feedback (via UI or API)
- Stores feedback in Cloudflare **D1**
- Uses **Workers AI** to classify / summarize / extract themes
- Shows a dashboard / results UI

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
- Vite  / Static assets in `public/` 

## Project Structure
```txt
src/            # Worker code / API routes
public/         # Static frontend assets (if any)
migrations/     # D1 migrations
test/           # tests
wrangler.jsonc  # Cloudflare config

