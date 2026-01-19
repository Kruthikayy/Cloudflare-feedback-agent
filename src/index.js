// Cloudsignal - Signal Extraction & Noise-Trimming Relay Yard
// Cloudflare Internal Feedback Intelligence Tool
// Uses: Workers AI, D1 Database

// Analyze feedback using Workers AI
async function analyzeFeedback(ai, content) {
  try {
    const prompt = `Analyze this customer feedback and respond in JSON format only:
    
Feedback: "${content}"

Respond with exactly this JSON structure (no other text):
{
  "sentiment": "positive" or "negative" or "neutral",
  "priority": "P0" or "P1" or "P2" or "P3",
  "category": "bug" or "feature-request" or "documentation" or "performance" or "billing" or "ux" or "general",
  "impact": "critical" or "high" or "medium" or "low",
  "themes": ["theme1", "theme2"]
}

Rules for Priority:
- P0: Critical - System down, security issue, data loss, blocking all users
- P1: High - Major functionality broken, billing issues, blocking many users
- P2: Medium - Feature requests, non-critical bugs, documentation gaps
- P3: Low - Minor improvements, nice-to-haves, cosmetic issues

Rules for Category:
- bug: Something is broken or not working as expected
- feature-request: User wants new functionality
- documentation: Confusion about docs, guides, or instructions
- performance: Speed, latency, or resource issues
- billing: Payment, pricing, or subscription issues
- ux: User interface or experience feedback
- general: Other feedback that doesn't fit above`;

    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: prompt,
      max_tokens: 200
    });

    const text = response.response || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sentiment: parsed.sentiment || 'neutral',
        priority: parsed.priority || 'P2',
        category: parsed.category || 'general',
        impact: parsed.impact || 'medium',
        themes: parsed.themes || ['general']
      };
    }
    
    return {
      sentiment: 'neutral',
      priority: 'P2',
      category: 'general',
      impact: 'medium',
      themes: ['unanalyzed']
    };
  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      sentiment: 'neutral',
      priority: 'P2',
      category: 'general',
      impact: 'medium',
      themes: ['error']
    };
  }
}

// AI Agent chat function
async function chatWithAgent(ai, db, question) {
  try {
    const { results: feedback } = await db.prepare(`
      SELECT * FROM feedback ORDER BY timestamp DESC LIMIT 20
    `).all();

    const feedbackContext = feedback.map(f => 
      `[${f.source}] ${f.content} (Priority: ${f.priority || 'unset'}, Category: ${f.category || 'unset'}, Sentiment: ${f.sentiment || 'unknown'}, Impact: ${f.impact || 'unknown'})`
    ).join('\n');

    const prompt = `You are CloudSignal, an AI-powered feedback analysis system for Product Managers. You help PMs understand customer feedback patterns, prioritize issues, and make data-driven decisions.

Here is the current feedback data:
${feedbackContext}

User Question: ${question}

Respond as a professional PM tool would:
- Be concise and actionable
- Use data from the feedback to support your analysis
- Prioritize by impact and urgency
- Group related issues together
- Suggest next steps when appropriate

FORMATTING RULES:
- NO markdown (no **, no *, no #)
- Use plain text only
- Use numbers (1. 2. 3.) for lists
- Keep responses professional and concise`;

    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: prompt,
      max_tokens: 500
    });

    return response.response || 'Unable to process request. Please try again.';
  } catch (error) {
    console.error('Chat error:', error);
    return 'Error processing your question. Please try again.';
  }
}

// Professional Cloudflare-styled UI
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CloudSignal | Cloudflare Feedback Intelligence</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --cf-orange: #f6821f;
      --cf-orange-dark: #e07318;
      --cf-orange-light: #ff9a47;
      --bg-primary: #1a1a1a;
      --bg-secondary: #242424;
      --bg-tertiary: #2d2d2d;
      --bg-hover: #363636;
      --border-color: #404040;
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --text-muted: #6b6b6b;
      --success: #34d399;
      --warning: #fbbf24;
      --error: #f87171;
      --info: #60a5fa;
      --p0: #ef4444;
      --p1: #f97316;
      --p2: #eab308;
      --p3: #22c55e;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
    }

    /* Sidebar */
    .sidebar {
      width: 240px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }

    .sidebar-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      width: 32px;
      height: 32px;
      background: var(--cf-orange);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .logo-text {
      font-weight: 700;
      font-size: 15px;
      letter-spacing: -0.3px;
    }

    .logo-subtitle {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 24px;
    }

    .nav-section-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: rgba(246, 130, 31, 0.15);
      color: var(--cf-orange);
    }

    .nav-item .icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .nav-item .badge {
      margin-left: auto;
      background: var(--bg-tertiary);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }

    .nav-item.active .badge {
      background: rgba(246, 130, 31, 0.2);
      color: var(--cf-orange);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 240px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Header */
    .header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      font-family: inherit;
    }

    .btn-primary {
      background: var(--cf-orange);
      color: white;
    }

    .btn-primary:hover {
      background: var(--cf-orange-dark);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-hover);
    }

    /* Stats Bar */
    .stats-bar {
      display: flex;
      gap: 16px;
      padding: 16px 24px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }

    .stat-card {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px 20px;
      min-width: 140px;
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .stat-value.p0 { color: var(--p0); }
    .stat-value.p1 { color: var(--p1); }
    .stat-value.p2 { color: var(--p2); }
    .stat-value.success { color: var(--success); }

    /* Content Area */
    .content-area {
      display: flex;
      flex: 1;
    }

    /* Feedback Table */
    .table-container {
      flex: 1;
      padding: 24px;
      overflow-x: auto;
    }

    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .table-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .table-filters {
      display: flex;
      gap: 8px;
    }

    .filter-chip {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-chip:hover, .filter-chip.active {
      background: rgba(246, 130, 31, 0.15);
      border-color: var(--cf-orange);
      color: var(--cf-orange);
    }

    .feedback-table {
      width: 100%;
      border-collapse: collapse;
    }

    .feedback-table th {
      text-align: left;
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-secondary);
      position: sticky;
      top: 0;
    }

    .feedback-table td {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      font-size: 13px;
      vertical-align: top;
    }

    .feedback-table tr:hover {
      background: var(--bg-secondary);
    }

    .priority-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 22px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .priority-badge.p0 { background: rgba(239, 68, 68, 0.2); color: var(--p0); }
    .priority-badge.p1 { background: rgba(249, 115, 22, 0.2); color: var(--p1); }
    .priority-badge.p2 { background: rgba(234, 179, 8, 0.2); color: var(--p2); }
    .priority-badge.p3 { background: rgba(34, 197, 94, 0.2); color: var(--p3); }

    .category-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .category-badge.bug { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
    .category-badge.feature-request { background: rgba(96, 165, 250, 0.15); color: #93c5fd; }
    .category-badge.documentation { background: rgba(167, 139, 250, 0.15); color: #c4b5fd; }
    .category-badge.performance { background: rgba(251, 191, 36, 0.15); color: #fcd34d; }
    .category-badge.billing { background: rgba(244, 114, 182, 0.15); color: #f9a8d4; }
    .category-badge.ux { background: rgba(45, 212, 191, 0.15); color: #5eead4; }

    .source-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      background: var(--bg-tertiary);
    }

    .sentiment-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .sentiment-dot.positive { background: var(--success); }
    .sentiment-dot.negative { background: var(--error); }
    .sentiment-dot.neutral { background: var(--text-muted); }

    .feedback-content {
      max-width: 400px;
      line-height: 1.5;
      color: var(--text-primary);
    }

    .feedback-author {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .theme-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .theme-tag {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 3px;
      background: var(--bg-hover);
      color: var(--text-secondary);
    }

    /* AI Panel */
    .ai-panel {
      width: 380px;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
    }

    .ai-panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ai-icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, var(--cf-orange), var(--cf-orange-light));
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .ai-panel-title {
      font-size: 14px;
      font-weight: 600;
    }

    .ai-panel-subtitle {
      font-size: 11px;
      color: var(--text-muted);
    }

    .ai-suggestions {
      padding: 12px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      border-bottom: 1px solid var(--border-color);
    }

    .ai-suggestion {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .ai-suggestion:hover {
      border-color: var(--cf-orange);
      color: var(--cf-orange);
    }

    .ai-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .ai-message {
      margin-bottom: 16px;
    }

    .ai-message.user {
      text-align: right;
    }

    .ai-message-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 6px;
      font-weight: 500;
    }

    .ai-message-bubble {
      display: inline-block;
      max-width: 90%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.6;
      text-align: left;
      white-space: pre-wrap;
    }

    .ai-message.user .ai-message-bubble {
      background: var(--cf-orange);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .ai-message.assistant .ai-message-bubble {
      background: var(--bg-tertiary);
      border-bottom-left-radius: 4px;
    }

    .ai-input-container {
      padding: 16px;
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 8px;
    }

    .ai-input {
      flex: 1;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--text-primary);
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .ai-input:focus {
      border-color: var(--cf-orange);
    }

    .ai-input::placeholder {
      color: var(--text-muted);
    }

    .ai-send-btn {
      background: var(--cf-orange);
      border: none;
      border-radius: 8px;
      padding: 0 16px;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .ai-send-btn:hover {
      background: var(--cf-orange-dark);
    }

    .ai-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Loading */
    .loading {
      display: inline-flex;
      gap: 4px;
    }

    .loading span {
      width: 6px;
      height: 6px;
      background: var(--cf-orange);
      border-radius: 50%;
      animation: bounce 1.4s ease-in-out infinite;
    }

    .loading span:nth-child(1) { animation-delay: -0.32s; }
    .loading span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .ai-panel {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
      .main-content {
        margin-left: 0;
      }
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">S</div>
      <div>
        <div class="logo-text">Cloudsignal</div>
        <div class="logo-subtitle">FEEDBACK INTELLIGENCE</div>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">Overview</div>
        <div class="nav-item active">
          <span class="icon">📊</span>
          <span>Dashboard</span>
        </div>
        <div class="nav-item">
          <span class="icon">📥</span>
          <span>All Feedback</span>
          <span class="badge" id="totalBadge">-</span>
        </div>
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">By Priority</div>
        <div class="nav-item" onclick="filterByPriority('P0')">
          <span class="icon">🔴</span>
          <span>P0 - Critical</span>
          <span class="badge" id="p0Badge">-</span>
        </div>
        <div class="nav-item" onclick="filterByPriority('P1')">
          <span class="icon">🟠</span>
          <span>P1 - High</span>
          <span class="badge" id="p1Badge">-</span>
        </div>
        <div class="nav-item" onclick="filterByPriority('P2')">
          <span class="icon">🟡</span>
          <span>P2 - Medium</span>
          <span class="badge" id="p2Badge">-</span>
        </div>
        <div class="nav-item" onclick="filterByPriority('P3')">
          <span class="icon">🟢</span>
          <span>P3 - Low</span>
          <span class="badge" id="p3Badge">-</span>
        </div>
      </div>

      <div class="nav-section">
        <div class="nav-section-title">By Category</div>
        <div class="nav-item" onclick="filterByCategory('bug')">
          <span class="icon">🐛</span>
          <span>Bugs</span>
        </div>
        <div class="nav-item" onclick="filterByCategory('feature-request')">
          <span class="icon">💡</span>
          <span>Feature Requests</span>
        </div>
        <div class="nav-item" onclick="filterByCategory('performance')">
          <span class="icon">⚡</span>
          <span>Performance</span>
        </div>
        <div class="nav-item" onclick="filterByCategory('billing')">
          <span class="icon">💳</span>
          <span>Billing</span>
        </div>
      </div>

      <div class="nav-section">
        <div class="nav-section-title">By Source</div>
        <div class="nav-item" onclick="filterBySource('discord')">
          <span class="icon">💬</span>
          <span>Discord</span>
        </div>
        <div class="nav-item" onclick="filterBySource('github')">
          <span class="icon">🐙</span>
          <span>GitHub</span>
        </div>
        <div class="nav-item" onclick="filterBySource('support')">
          <span class="icon">🎫</span>
          <span>Support</span>
        </div>
        <div class="nav-item" onclick="filterBySource('twitter')">
          <span class="icon">🐦</span>
          <span>Twitter</span>
        </div>
      </div>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    <header class="header">
      <div class="header-left">
        <h1 class="page-title">Feedback Dashboard</h1>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" onclick="refreshFeedback()">
          <span>↻</span> Refresh
        </button>
        <button class="btn btn-primary" onclick="analyzeAll()" id="analyzeBtn">
          <span>⚡</span> Run Analysis
        </button>
      </div>
    </header>

    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-label">Total Signals</div>
        <div class="stat-value" id="statTotal">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">P0 Critical</div>
        <div class="stat-value p0" id="statP0">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">P1 High</div>
        <div class="stat-value p1" id="statP1">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Positive</div>
        <div class="stat-value success" id="statPositive">-</div>
      </div>
    </div>

    <div class="content-area">
      <div class="table-container">
        <div class="table-header">
          <div class="table-title">FEEDBACK SIGNALS • <span id="filterLabel">All</span></div>
          <div class="table-filters">
            <span class="filter-chip active" onclick="clearFilters()">All</span>
            <span class="filter-chip" onclick="filterBySentiment('negative')">Negative</span>
            <span class="filter-chip" onclick="filterBySentiment('positive')">Positive</span>
          </div>
        </div>
        
        <table class="feedback-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Category</th>
              <th>Feedback</th>
              <th>Source</th>
              <th>Sentiment</th>
              <th>Themes</th>
            </tr>
          </thead>
          <tbody id="feedbackTableBody">
            <tr>
              <td colspan="6">
                <div class="empty-state">
                  <div class="empty-state-icon">📡</div>
                  <div>Loading signals...</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- AI Panel -->
      <aside class="ai-panel">
        <div class="ai-panel-header">
          <div class="ai-icon">🤖</div>
          <div>
            <div class="ai-panel-title">AI Assistant</div>
            <div class="ai-panel-subtitle">Ask questions about your feedback</div>
          </div>
        </div>

        <div class="ai-suggestions">
          <span class="ai-suggestion" onclick="askQuestion('What are the P0 critical issues?')">P0 Issues</span>
          <span class="ai-suggestion" onclick="askQuestion('Summarize bug reports')">Bug Summary</span>
          <span class="ai-suggestion" onclick="askQuestion('What features are requested?')">Feature Requests</span>
          <span class="ai-suggestion" onclick="askQuestion('What should we prioritize?')">Prioritization</span>
        </div>

        <div class="ai-messages" id="aiMessages">
          <div class="ai-message assistant">
            <div class="ai-message-label">CloudSignal AI</div>
            <div class="ai-message-bubble">Welcome to CloudSignal. I can help you analyze feedback patterns, identify critical issues, and prioritize your backlog. What would you like to know?</div>
          </div>
        </div>

        <div class="ai-input-container">
          <input type="text" class="ai-input" id="aiInput" placeholder="Ask about your feedback..." onkeypress="handleKeyPress(event)">
          <button class="ai-send-btn" id="aiSendBtn" onclick="sendMessage()">→</button>
        </div>
      </aside>
    </div>
  </main>

  <script>
    let allFeedback = [];
    let currentFilter = null;

    document.addEventListener('DOMContentLoaded', () => {
      loadFeedback();
    });

    async function loadFeedback() {
      try {
        const response = await fetch('/api/feedback');
        const data = await response.json();
        if (data.feedback) {
          allFeedback = data.feedback;
          renderFeedback(allFeedback);
          updateStats(allFeedback);
        }
      } catch (error) {
        console.error('Error loading feedback:', error);
      }
    }

    function renderFeedback(feedback) {
      const tbody = document.getElementById('feedbackTableBody');
      
      if (!feedback || feedback.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">📡</div><div>No signals found</div></div></td></tr>';
        return;
      }

      tbody.innerHTML = feedback.map(item => {
        const priority = item.priority || 'P2';
        const category = item.category || 'general';
        const sentiment = item.sentiment || 'neutral';
        const themes = item.themes ? item.themes.split(',') : [];
        
        return '<tr>' +
          '<td><span class="priority-badge ' + priority.toLowerCase() + '">' + priority + '</span></td>' +
          '<td><span class="category-badge ' + category + '">' + formatCategory(category) + '</span></td>' +
          '<td><div class="feedback-content">' + item.content + '</div><div class="feedback-author">@' + (item.author || 'anonymous') + '</div></td>' +
          '<td><span class="source-badge">' + getSourceIcon(item.source) + ' ' + item.source + '</span></td>' +
          '<td><span class="sentiment-dot ' + sentiment + '"></span></td>' +
          '<td><div class="theme-tags">' + themes.map(t => '<span class="theme-tag">' + t.trim() + '</span>').join('') + '</div></td>' +
        '</tr>';
      }).join('');
    }

    function updateStats(feedback) {
      const total = feedback.length;
      const p0 = feedback.filter(f => f.priority === 'P0').length;
      const p1 = feedback.filter(f => f.priority === 'P1').length;
      const p2 = feedback.filter(f => f.priority === 'P2').length;
      const p3 = feedback.filter(f => f.priority === 'P3').length;
      const positive = feedback.filter(f => f.sentiment === 'positive').length;

      document.getElementById('statTotal').textContent = total;
      document.getElementById('statP0').textContent = p0;
      document.getElementById('statP1').textContent = p1;
      document.getElementById('statPositive').textContent = positive;
      document.getElementById('totalBadge').textContent = total;
      document.getElementById('p0Badge').textContent = p0;
      document.getElementById('p1Badge').textContent = p1;
      document.getElementById('p2Badge').textContent = p2;
      document.getElementById('p3Badge').textContent = p3;
    }

    function formatCategory(cat) {
      const labels = {
        'bug': 'Bug',
        'feature-request': 'Feature',
        'documentation': 'Docs',
        'performance': 'Perf',
        'billing': 'Billing',
        'ux': 'UX',
        'general': 'General'
      };
      return labels[cat] || cat;
    }

    function getSourceIcon(source) {
      const icons = { discord: '💬', github: '🐙', support: '🎫', twitter: '🐦', forums: '💭' };
      return icons[source] || '📝';
    }

    function filterByPriority(priority) {
      const filtered = allFeedback.filter(f => f.priority === priority);
      renderFeedback(filtered);
      document.getElementById('filterLabel').textContent = priority + ' Priority';
    }

    function filterByCategory(category) {
      const filtered = allFeedback.filter(f => f.category === category);
      renderFeedback(filtered);
      document.getElementById('filterLabel').textContent = formatCategory(category);
    }

    function filterBySource(source) {
      const filtered = allFeedback.filter(f => f.source === source);
      renderFeedback(filtered);
      document.getElementById('filterLabel').textContent = source;
    }

    function filterBySentiment(sentiment) {
      const filtered = allFeedback.filter(f => f.sentiment === sentiment);
      renderFeedback(filtered);
      document.getElementById('filterLabel').textContent = sentiment;
    }

    function clearFilters() {
      renderFeedback(allFeedback);
      document.getElementById('filterLabel').textContent = 'All';
    }

    async function analyzeAll() {
      const btn = document.getElementById('analyzeBtn');
      btn.innerHTML = '<span class="loading"><span></span><span></span><span></span></span> Analyzing...';
      btn.disabled = true;
      
      try {
        const response = await fetch('/api/analyze', { method: 'POST' });
        await response.json();
        await loadFeedback();
      } catch (error) {
        console.error('Error analyzing:', error);
      }
      
      btn.innerHTML = '<span>⚡</span> Run Analysis';
      btn.disabled = false;
    }

    function refreshFeedback() {
      loadFeedback();
    }

    async function sendMessage() {
      const input = document.getElementById('aiInput');
      const message = input.value.trim();
      if (!message) return;

      addMessage(message, 'user');
      input.value = '';
      
      const sendBtn = document.getElementById('aiSendBtn');
      sendBtn.disabled = true;
      addMessage('<span class="loading"><span></span><span></span><span></span></span>', 'assistant', true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: message })
        });
        const data = await response.json();
        
        const messages = document.getElementById('aiMessages');
        messages.removeChild(messages.lastChild);
        addMessage(data.response || 'Unable to process request.', 'assistant');
      } catch (error) {
        const messages = document.getElementById('aiMessages');
        messages.removeChild(messages.lastChild);
        addMessage('Error processing request. Please try again.', 'assistant');
      }

      sendBtn.disabled = false;
    }

    function addMessage(content, type) {
      const container = document.getElementById('aiMessages');
      const message = document.createElement('div');
      message.className = 'ai-message ' + type;
      message.innerHTML = '<div class="ai-message-label">' + (type === 'user' ? 'You' : 'CloudSignal AI') + '</div><div class="ai-message-bubble">' + content + '</div>';
      container.appendChild(message);
      container.scrollTop = container.scrollHeight;
    }

    function askQuestion(question) {
      document.getElementById('aiInput').value = question;
      sendMessage();
    }

    function handleKeyPress(event) {
      if (event.key === 'Enter') sendMessage();
    }
  </script>
</body>
</html>`;
}

// Main Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      if (path === '/' || path === '') {
        return new Response(getHTML(), { headers: { 'Content-Type': 'text/html', ...corsHeaders } });
      }
      
      if (path === '/api/feedback' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM feedback ORDER BY timestamp DESC').all();
        return new Response(JSON.stringify({ feedback: results }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      if (path === '/api/analyze' && request.method === 'POST') {
        const { results } = await env.DB.prepare('SELECT * FROM feedback WHERE priority IS NULL OR priority = ""').all();
        for (const item of results) {
          const analysis = await analyzeFeedback(env.AI, item.content);
          await env.DB.prepare('UPDATE feedback SET sentiment = ?, priority = ?, category = ?, impact = ?, themes = ?, analyzed_at = ? WHERE id = ?')
            .bind(analysis.sentiment, analysis.priority, analysis.category, analysis.impact, analysis.themes.join(','), new Date().toISOString(), item.id).run();
        }
        return new Response(JSON.stringify({ success: true, analyzed: results.length }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      if (path === '/api/chat' && request.method === 'POST') {
        const body = await request.json();
        const response = await chatWithAgent(env.AI, env.DB, body.question);
        return new Response(JSON.stringify({ response }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  },
};