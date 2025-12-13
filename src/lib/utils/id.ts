import * as Crypto from 'expo-crypto';

/**
 * Generate a unique identifier using UUID v4
 */
export function generateId(): string {
  return Crypto.randomUUID();
}
