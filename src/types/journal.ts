export interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  promptId?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalPrompt {
  id: string;
  category: 'reflection' | 'gratitude' | 'growth' | 'emotion';
  text: string;
  usedAt?: Date;
}

export interface JournalSearchResult {
  entry: JournalEntry;
  matchedText: string;
  matchIndex: number;
}
