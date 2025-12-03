import { eq, desc, like, or } from 'drizzle-orm';
import { db } from '../client';
import { journalEntries, prompts, type JournalEntryRow, type NewJournalEntry, type PromptRow } from '../schema';
import type { JournalEntry, JournalPrompt } from '@/src/types/journal';

// Convert database row to app type
function toJournalEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    title: row.title ?? undefined,
    content: row.content,
    promptId: row.promptId ?? undefined,
    mood: row.mood as 1 | 2 | 3 | 4 | 5 | undefined,
    tags: row.tags ? JSON.parse(row.tags) : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toPrompt(row: PromptRow): JournalPrompt {
  return {
    id: row.id,
    category: row.category as JournalPrompt['category'],
    text: row.text,
    usedAt: row.usedAt ?? undefined,
  };
}

// Generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Create a new journal entry
export async function createJournalEntry(data: {
  title?: string;
  content: string;
  promptId?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}): Promise<JournalEntry> {
  const now = new Date();
  const entry: NewJournalEntry = {
    id: generateId(),
    title: data.title ?? null,
    content: data.content,
    promptId: data.promptId ?? null,
    mood: data.mood ?? null,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(journalEntries).values(entry);
  return toJournalEntry(entry as JournalEntryRow);
}

// Update a journal entry
export async function updateJournalEntry(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    mood: 1 | 2 | 3 | 4 | 5;
    tags: string[];
  }>
): Promise<JournalEntry | null> {
  const updateData: Partial<JournalEntryRow> = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.mood !== undefined) updateData.mood = data.mood;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

  await db.update(journalEntries).set(updateData).where(eq(journalEntries.id, id));
  return getJournalEntryById(id);
}

// Get all journal entries
export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  const rows = await db
    .select()
    .from(journalEntries)
    .orderBy(desc(journalEntries.createdAt));
  return rows.map(toJournalEntry);
}

// Get journal entry by ID
export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  const rows = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, id))
    .limit(1);

  return rows.length > 0 ? toJournalEntry(rows[0]) : null;
}

// Search journal entries
export async function searchJournalEntries(query: string): Promise<JournalEntry[]> {
  const searchPattern = `%${query}%`;
  const rows = await db
    .select()
    .from(journalEntries)
    .where(
      or(
        like(journalEntries.title, searchPattern),
        like(journalEntries.content, searchPattern),
        like(journalEntries.tags, searchPattern)
      )
    )
    .orderBy(desc(journalEntries.createdAt));

  return rows.map(toJournalEntry);
}

// Delete a journal entry
export async function deleteJournalEntry(id: string): Promise<void> {
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
}

// Get all prompts
export async function getAllPrompts(): Promise<JournalPrompt[]> {
  const rows = await db.select().from(prompts);
  return rows.map(toPrompt);
}

// Get prompts by category
export async function getPromptsByCategory(category: string): Promise<JournalPrompt[]> {
  const rows = await db
    .select()
    .from(prompts)
    .where(eq(prompts.category, category));
  return rows.map(toPrompt);
}

// Get random prompt (optionally by category)
export async function getRandomPrompt(category?: string): Promise<JournalPrompt | null> {
  let rows: PromptRow[];

  if (category) {
    rows = await db.select().from(prompts).where(eq(prompts.category, category));
  } else {
    rows = await db.select().from(prompts);
  }

  if (rows.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * rows.length);
  return toPrompt(rows[randomIndex]);
}

// Mark prompt as used
export async function markPromptUsed(id: string): Promise<void> {
  await db.update(prompts).set({ usedAt: new Date() }).where(eq(prompts.id, id));
}
