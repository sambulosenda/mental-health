import { eq, desc } from 'drizzle-orm';
import { db } from '../client';
import {
  chatConversations,
  chatMessages,
  type ChatConversationRow,
  type ChatMessageRow,
  type NewChatConversation,
  type NewChatMessage,
} from '../schema';
import type {
  ChatConversation,
  ChatMessage,
  ConversationType,
  ChatConversationMetadata,
} from '@/src/types/chat';

// Generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Convert database row to app type
function toConversation(row: ChatConversationRow): ChatConversation {
  return {
    id: row.id,
    type: row.type as ConversationType,
    title: row.title ?? undefined,
    linkedMoodId: row.linkedMoodId ?? undefined,
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  };
}

function toMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversationId,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    timestamp: row.timestamp,
  };
}

// Create a new conversation
export async function createConversation(
  type: ConversationType
): Promise<ChatConversation> {
  const now = new Date();
  const entry: NewChatConversation = {
    id: generateId(),
    type,
    startedAt: now,
  };

  await db.insert(chatConversations).values(entry);
  return toConversation(entry as ChatConversationRow);
}

// End a conversation
export async function endConversation(
  id: string,
  metadata?: ChatConversationMetadata
): Promise<void> {
  const now = new Date();
  await db
    .update(chatConversations)
    .set({
      endedAt: now,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    })
    .where(eq(chatConversations.id, id));
}

// Update conversation metadata
export async function updateConversationMetadata(
  id: string,
  metadata: ChatConversationMetadata
): Promise<void> {
  await db
    .update(chatConversations)
    .set({ metadata: JSON.stringify(metadata) })
    .where(eq(chatConversations.id, id));
}

// Link conversation to mood entry
export async function linkConversationToMood(
  conversationId: string,
  moodId: string
): Promise<void> {
  await db
    .update(chatConversations)
    .set({ linkedMoodId: moodId })
    .where(eq(chatConversations.id, conversationId));
}

// Add a message to a conversation
export async function addMessage(data: {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
}): Promise<ChatMessage> {
  const now = new Date();
  const entry: NewChatMessage = {
    id: generateId(),
    conversationId: data.conversationId,
    role: data.role,
    content: data.content,
    timestamp: now,
  };

  await db.insert(chatMessages).values(entry);
  return toMessage(entry as ChatMessageRow);
}

// Get a conversation by ID
export async function getConversation(
  id: string
): Promise<ChatConversation | null> {
  const rows = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.id, id))
    .limit(1);

  return rows.length > 0 ? toConversation(rows[0]) : null;
}

// Get all messages for a conversation
export async function getConversationMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.timestamp);

  return rows.map(toMessage);
}

// Get recent conversations
export async function getRecentConversations(
  limit: number = 10
): Promise<ChatConversation[]> {
  const rows = await db
    .select()
    .from(chatConversations)
    .orderBy(desc(chatConversations.startedAt))
    .limit(limit);

  return rows.map(toConversation);
}

// Delete a conversation and its messages
export async function deleteConversation(id: string): Promise<void> {
  await db.delete(chatMessages).where(eq(chatMessages.conversationId, id));
  await db.delete(chatConversations).where(eq(chatConversations.id, id));
}

// Delete all conversations
export async function deleteAllConversations(): Promise<void> {
  await db.delete(chatMessages);
  await db.delete(chatConversations);
}
