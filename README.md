CF AI-Powered Feedback Aggregation Agent: An intelligent feedback analysis tool that helps Product Managers aggregate, query, and extract insights from customer feedback across multiple channels using natural language.

Try it Live:

[Try the tool here](https://feedback-agent.ykruthikasonwalkar.workers.dev/)

[Cloudflare Workers](https://workers.cloudflare.com/)

Sample queries:

"What are the biggest issues customers are reporting?"
"Show me negative feedback from this week"
"What are customers saying about login issues?"


Getting Started
Prerequisites

Node.js (v18 or higher)
Wrangler CLI (npm install -g wrangler)
A Cloudflare account with Workers enabled

Installation

Clone the repository:

bashgit clone https://github.com/Kruthikayy/Cloudflare-feedback-agent.git
cd Cloudflare-feedback-agent

Install dependencies:

bashnpm install

Set up D1 Database:

bashnpx wrangler d1 create feedback-db
npx wrangler d1 execute DB --remote --file=./schema.sql

Deploy to Cloudflare:

bashnpx wrangler deploy

Cloudflare Architecture
This project runs entirely on Cloudflare's edge infrastructure using three core products.
1. Cloudflare Workers
The Worker serves both the chat UI and API endpoints from a single deployment.

File: src/index.js
Role: Handles incoming requests, serves the frontend, processes chat queries, and orchestrates communication between D1 and Workers AI.

2. D1 Database
Cloudflare's serverless SQL database stores structured feedback entries.

Schema: Feedback entries with fields for source, sentiment, category, content, and timestamp
Queries: Supports flexible filtering like "all negative bugs from last week" via standard SQL

3. Workers AI
Powers the conversational AI agent using the Llama 3.1-8b model.

Role: Interprets natural language questions and generates context-aware responses based on feedback data
Benefit: Edge inference with low latency — no external API dependencies


How It Works
1. User Query
The user types a natural language question into the chat interface (e.g., "What are customers complaining about?").
2. Feedback Retrieval
The Worker queries the D1 database to fetch relevant feedback entries:
sqlSELECT * FROM feedback ORDER BY timestamp DESC LIMIT 30
```

### 3. AI Analysis
The retrieved feedback and user question are passed to Workers AI. The Llama 3.1-8b model analyzes the data and generates an intelligent, summarized response highlighting key themes, sentiment patterns, and urgency.

### 4. Response Delivery
The AI-generated insight is returned to the user in the chat interface, complete with specific examples and mention counts.

---

## Project Structure
```
├── src/
│   └── index.js        # Main Worker logic
├── schema.sql          # D1 database schema
├── wrangler.jsonc      # Cloudflare configuration
└── package.json

Local Development
bash# Run locally with Wrangler
npx wrangler dev

# Note: Run migrations locally first
npx wrangler d1 execute DB --local --file=./schema.sql

Built With

Cloudflare Workers — Serverless edge compute
Cloudflare D1 — Serverless SQL database
Cloudflare Workers AI — Edge AI inference

