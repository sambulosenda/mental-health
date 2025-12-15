import { formatErrorMessage } from '@/src/lib/utils';

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>)
) => void;

interface AsyncActionOptions {
  showLoading?: boolean;
  errorFallback: string;
}

/**
 * Wrapper for async store actions with loading/error handling
 *
 * Usage:
 * ```
 * loadEntries: async () => {
 *   await asyncAction(set, { errorFallback: 'Failed to load' }, async () => {
 *     const entries = await getAllEntries();
 *     return { entries };
 *   });
 * }
 * ```
 */
export async function asyncAction<T extends { isLoading: boolean; error: string | null }>(
  set: SetState<T>,
  options: AsyncActionOptions,
  action: () => Promise<Partial<T>>
): Promise<boolean> {
  const { showLoading = true, errorFallback } = options;

  if (showLoading) {
    set({ isLoading: true, error: null } as Partial<T>);
  }

  try {
    const result = await action();
    set({ ...result, isLoading: false } as Partial<T>);
    return true;
  } catch (error) {
    set({
      error: formatErrorMessage(error, errorFallback),
      isLoading: false,
    } as Partial<T>);
    return false;
  }
}

/**
 * Silent async action - logs errors but doesn't set error state
 */
export async function silentAction<T>(
  action: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await action();
  } catch (error) {
    console.error(`[${context}]`, error);
    return null;
  }
}
