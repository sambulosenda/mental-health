import { File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { format } from 'date-fns';
import type { MoodEntry } from '@/src/types/mood';
import type { JournalEntry } from '@/src/types/journal';
import { moodLabels, activityTags } from '@/src/constants/theme';

interface ExportData {
  moods: MoodEntry[];
  journals: JournalEntry[];
}

export async function exportToCSV(data: ExportData): Promise<void> {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');

  // Create mood CSV
  if (data.moods.length > 0) {
    const moodCsv = createMoodCSV(data.moods);
    const file = new File(Paths.cache, `softmind_moods_${timestamp}.csv`);
    await file.write(moodCsv);
    await shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Mood Data',
    });
  }
}

export async function exportJournalToCSV(journals: JournalEntry[]): Promise<void> {
  if (journals.length === 0) return;

  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
  const journalCsv = createJournalCSV(journals);
  const file = new File(Paths.cache, `softmind_journal_${timestamp}.csv`);
  await file.write(journalCsv);

  await shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Journal Data',
  });
}

export async function exportMoodToCSV(moods: MoodEntry[]): Promise<void> {
  if (moods.length === 0) return;

  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
  const moodCsv = createMoodCSV(moods);
  const file = new File(Paths.cache, `softmind_moods_${timestamp}.csv`);
  await file.write(moodCsv);

  await shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Mood Data',
  });
}

function createMoodCSV(moods: MoodEntry[]): string {
  const headers = ['Date', 'Time', 'Mood Score', 'Mood Label', 'Activities', 'Note'];
  const rows = moods.map((mood) => {
    const date = format(mood.timestamp, 'yyyy-MM-dd');
    const time = format(mood.timestamp, 'HH:mm');
    const moodLabel = moodLabels[mood.mood]?.label ?? '';
    const activities = mood.activities
      .map((id) => activityTags.find((t) => t.id === id)?.label ?? id)
      .join('; ');
    const note = escapeCSV(mood.note ?? '');

    return [date, time, mood.mood, moodLabel, activities, note].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function createJournalCSV(journals: JournalEntry[]): string {
  const headers = ['Date', 'Time', 'Title', 'Content', 'Mood', 'Tags'];
  const rows = journals.map((journal) => {
    const date = format(journal.createdAt, 'yyyy-MM-dd');
    const time = format(journal.createdAt, 'HH:mm');
    const title = escapeCSV(journal.title ?? '');
    const content = escapeCSV(journal.content);
    const mood = journal.mood ? moodLabels[journal.mood]?.label ?? '' : '';
    const tags = (journal.tags ?? []).join('; ');

    return [date, time, title, content, mood, tags].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportAllData(data: ExportData): Promise<void> {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');

  const exportContent = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    moods: data.moods.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
      createdAt: m.createdAt.toISOString(),
    })),
    journals: data.journals.map((j) => ({
      ...j,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
    })),
  };

  const file = new File(Paths.cache, `softmind_export_${timestamp}.json`);
  await file.write(JSON.stringify(exportContent, null, 2));

  await shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export Softmind Data',
  });
}
