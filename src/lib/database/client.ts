import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// Create SQLite database
const expo = SQLite.openDatabaseSync('daysi.db');

// Create Drizzle instance
export const db = drizzle(expo, { schema });

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  // Create mood_entries table
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY,
      mood INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      activities TEXT,
      note TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // Create journal_entries table
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT NOT NULL,
      prompt_id TEXT,
      mood INTEGER,
      tags TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Create prompts table
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      text TEXT NOT NULL,
      used_at INTEGER
    );
  `);

  // Create insights table
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS insights (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      generated_at INTEGER NOT NULL,
      expires_at INTEGER
    );
  `);

  // Create chat_conversations table
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT,
      linked_mood_id TEXT,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      metadata TEXT
    );
  `);

  // Create chat_messages table
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
    );
  `);

  // Index for efficient message queries by conversation
  await expo.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
    ON chat_messages(conversation_id, timestamp);
  `);

  // Create exercise_sessions table
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS exercise_sessions (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      responses TEXT,
      mood_before INTEGER,
      mood_after INTEGER
    );
  `);

  // Index for efficient session queries
  await expo.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_exercise_sessions_template
    ON exercise_sessions(template_id, started_at);
  `);

  // Create assessment_sessions table (GAD-7, PHQ-9)
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      responses TEXT,
      total_score INTEGER,
      severity TEXT
    );
  `);

  // Index for efficient assessment queries
  await expo.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_assessment_sessions_type
    ON assessment_sessions(type, started_at);
  `);

  // Seed default prompts if empty
  const result = await expo.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM prompts');
  if (result?.count === 0) {
    await seedDefaultPrompts();
  }
}

async function seedDefaultPrompts(): Promise<void> {
  const defaultPrompts = [
    // Reflection
    { id: 'r1', category: 'reflection', text: 'What made you smile today?' },
    { id: 'r2', category: 'reflection', text: 'What challenged you today and how did you handle it?' },
    { id: 'r3', category: 'reflection', text: 'What is something you learned about yourself recently?' },
    { id: 'r4', category: 'reflection', text: 'How did your interactions with others affect your mood today?' },
    // Gratitude
    { id: 'g1', category: 'gratitude', text: 'What are three things you are grateful for today?' },
    { id: 'g2', category: 'gratitude', text: 'Who made a positive impact on your day?' },
    { id: 'g3', category: 'gratitude', text: 'What small moment brought you joy today?' },
    // Growth
    { id: 'gr1', category: 'growth', text: 'What is one thing you could do differently tomorrow?' },
    { id: 'gr2', category: 'growth', text: 'What goal are you working towards and how are you progressing?' },
    { id: 'gr3', category: 'growth', text: 'What fear are you ready to face?' },
    // Emotion
    { id: 'e1', category: 'emotion', text: 'What emotion has been most present for you today?' },
    { id: 'e2', category: 'emotion', text: 'What is weighing on your mind right now?' },
    { id: 'e3', category: 'emotion', text: 'When did you feel most at peace today?' },
  ];

  for (const prompt of defaultPrompts) {
    await expo.runAsync(
      'INSERT INTO prompts (id, category, text) VALUES (?, ?, ?)',
      [prompt.id, prompt.category, prompt.text]
    );
  }
}

// Export raw SQLite connection for direct queries if needed
export const sqliteDb = expo;
