import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Mood entries table
export const moodEntries = sqliteTable('mood_entries', {
  id: text('id').primaryKey(),
  mood: integer('mood').notNull(), // 1-5
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  activities: text('activities'), // JSON array of activity IDs
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Journal entries table
export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  title: text('title'),
  content: text('content').notNull(),
  promptId: text('prompt_id'), // Optional linked prompt
  mood: integer('mood'), // Optional linked mood (1-5)
  tags: text('tags'), // JSON array
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Journal prompts table
export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // 'reflection' | 'gratitude' | 'growth' | 'emotion'
  text: text('text').notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
});

// Generated insights cache table
export const insights = sqliteTable('insights', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'pattern' | 'trigger' | 'suggestion'
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON for additional data
  generatedAt: integer('generated_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

// Chat conversations table
export const chatConversations = sqliteTable('chat_conversations', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'chat' | 'checkin'
  title: text('title'),
  linkedMoodId: text('linked_mood_id'),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  metadata: text('metadata'), // JSON
});

// Chat messages table
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// Type exports for use in application
export type MoodEntryRow = typeof moodEntries.$inferSelect;
export type NewMoodEntry = typeof moodEntries.$inferInsert;
export type JournalEntryRow = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type PromptRow = typeof prompts.$inferSelect;
export type InsightRow = typeof insights.$inferSelect;
export type ChatConversationRow = typeof chatConversations.$inferSelect;
export type NewChatConversation = typeof chatConversations.$inferInsert;
export type ChatMessageRow = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
