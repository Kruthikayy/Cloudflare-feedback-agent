-- Initial feedback table schema

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  timestamp TEXT,
  sentiment TEXT,
  urgency TEXT,
  themes TEXT,
  analyzed_at TEXT
);
