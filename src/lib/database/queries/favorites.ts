import { eq, and, desc } from 'drizzle-orm';
import { db } from '../client';
import { favorites, type FavoriteRow, type NewFavorite } from '../schema';
import { generateId } from '@/src/lib/utils';

export type ContentType = 'meditation' | 'sleep_story' | 'exercise';

export interface Favorite {
  id: string;
  contentType: ContentType;
  contentId: string;
  createdAt: Date;
}

function toFavorite(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    contentType: row.contentType as ContentType,
    contentId: row.contentId,
    createdAt: row.createdAt,
  };
}

/**
 * Add a content item to favorites
 */
export async function addFavorite(
  contentType: ContentType,
  contentId: string
): Promise<Favorite> {
  const now = new Date();
  const entry: NewFavorite = {
    id: generateId(),
    contentType,
    contentId,
    createdAt: now,
  };

  await db.insert(favorites).values(entry);
  return toFavorite(entry as FavoriteRow);
}

/**
 * Remove a content item from favorites
 */
export async function removeFavorite(
  contentType: ContentType,
  contentId: string
): Promise<void> {
  await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.contentType, contentType),
        eq(favorites.contentId, contentId)
      )
    );
}

/**
 * Check if a content item is favorited
 */
export async function isFavorite(
  contentType: ContentType,
  contentId: string
): Promise<boolean> {
  const rows = await db
    .select()
    .from(favorites)
    .where(
      and(
        eq(favorites.contentType, contentType),
        eq(favorites.contentId, contentId)
      )
    )
    .limit(1);
  return rows.length > 0;
}

/**
 * Get all favorites, optionally filtered by content type
 */
export async function getFavorites(contentType?: ContentType): Promise<Favorite[]> {
  const query = db.select().from(favorites).orderBy(desc(favorites.createdAt));

  if (contentType) {
    const rows = await db
      .select()
      .from(favorites)
      .where(eq(favorites.contentType, contentType))
      .orderBy(desc(favorites.createdAt));
    return rows.map(toFavorite);
  }

  const rows = await query;
  return rows.map(toFavorite);
}

/**
 * Get all favorited content IDs for a specific type
 */
export async function getFavoriteIds(contentType: ContentType): Promise<Set<string>> {
  const rows = await db
    .select({ contentId: favorites.contentId })
    .from(favorites)
    .where(eq(favorites.contentType, contentType));
  return new Set(rows.map((r) => r.contentId));
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  contentType: ContentType,
  contentId: string
): Promise<boolean> {
  const isFav = await isFavorite(contentType, contentId);
  if (isFav) {
    await removeFavorite(contentType, contentId);
    return false;
  } else {
    await addFavorite(contentType, contentId);
    return true;
  }
}

/**
 * Get favorites count
 */
export async function getFavoritesCount(contentType?: ContentType): Promise<number> {
  const favs = await getFavorites(contentType);
  return favs.length;
}
