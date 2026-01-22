# CloudSignal

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)
![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-blue)
![Workers AI](https://img.shields.io/badge/Cloudflare-Workers%20AI-purple)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

**AI-Powered Feedback Aggregation for Product Managers**

CloudSignal helps Product Managers **ask natural language questions** over customer feedback and instantly get **summarized insights, sentiment patterns, and top issues** — all running at Cloudflare's edge.

### 👉 [Live Demo](https://feedback-agent.ykruthikasonwalkar.workers.dev/)

---

## What It Does

- Aggregates feedback from multiple sources
- Lets PMs query feedback naturally:
  - *"What are customers complaining about?"*
  - *"What broke after the last release?"*
- Uses AI to surface themes, urgency, and examples

## Why It's Interesting

- Runs **entirely on Cloudflare Workers**
- Uses **D1** for structured feedback storage
- Uses **Workers AI (Llama 3.1-8b)** for inference
- No external APIs or databases

---

## Why This Matters for Product Managers

Customer feedback is fragmented across tools, noisy, and hard to synthesize at scale. PMs often spend hours manually reading tickets, Slack threads, and support logs just to answer simple questions.

CloudSignal demonstrates how AI can:
- Reduce feedback analysis time from hours to seconds
- Help PMs quickly identify **top pain points**
- Surface **emerging issues before they escalate**
- Enable data-informed prioritization without dashboards

This project reflects real PM workflows:
- Asking open-ended questions
- Looking for patterns, not raw data
- Balancing speed, accuracy, and signal

CloudSignal is designed as a **thinking partner for PMs**, not just a reporting tool.

---

## Architecture

This project runs entirely on **Cloudflare's edge infrastructure** using three core products:

### Cloudflare Workers
The Worker serves both the chat UI and API endpoints from a single deployment.
- **File:** `src/index.js`
- **Role:** Handles incoming requests, serves the frontend, processes chat queries, and orchestrates communication between D1 and Workers AI

### Cloudflare D1
Cloudflare's serverless SQL database stores structured feedback entries.
- **Schema fields:** `source`, `sentiment`, `category`, `content`, `timestamp`
- **Capability:** Supports filtering like "negative feedback from last week" via SQL

### Cloudflare Workers AI
Powers the conversational AI agent using the **Llama 3.1-8b** model.
- **Role:** Interprets natural language questions and generates context-aware insights based on feedback data
- **Benefit:** Edge inference with low latency (no external API dependencies)

---

## How It Works

1. **User Query** — The user asks a question in natural language (e.g., "What are customers complaining about?")

2. **Feedback Retrieval (D1)** — The Worker fetches relevant feedback entries from D1:
   ```sql
   SELECT * FROM feedback
   ORDER BY timestamp DESC
   LIMIT 30;
   ```

3. **AI Analysis (Workers AI)** — The Worker passes the retrieved feedback + user question to Workers AI. The model identifies themes, sentiment patterns, and urgency.

4. **Response Delivery** — The AI-generated insight is returned to the chat UI with representative examples and mention counts.

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Wrangler CLI**
  ```bash
  npm install -g wrangler
  ```
- A Cloudflare account with Workers enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kruthikayy/Cloudflare-feedback-agent.git
   cd Cloudflare-feedback-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the D1 database:
   ```bash
   npx wrangler d1 create feedback-db
   npx wrangler d1 execute DB --remote --file=./schema.sql
   ```

4. Deploy to Cloudflare:
   ```bash
   npx wrangler deploy
   ```

### Local Development

```bash
# Start local dev server
npx wrangler dev

# Run database migrations locally
npx wrangler d1 execute DB --local --file=./schema.sql
```

---

## Design Principles

- **Edge-first:** Runs fully on Cloudflare primitives (Workers, D1, Workers AI)
- **Low operational overhead:** No external infrastructure required
- **Fast iteration:** Simple schema with flexible querying
- **PM-friendly:** Optimized for quick insight extraction, not raw data browsing

---

## Built With

Cloudflare Workers · D1 · Workers AI · Node.js

---

## Author

**Kruthika Sonwalkar**

[![GitHub](https://img.shields.io/badge/GitHub-Kruthikayy-black?logo=github)](https://github.com/Kruthikayy/Cloudflare-feedback-agent)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-kruthikasonwalkar-blue?logo=linkedin)](https://www.linkedin.com/in/kruthika-sonwalkar/)
