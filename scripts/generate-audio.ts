/**
 * ElevenLabs Audio Generation Script
 *
 * Generates audio files for sleep stories using ElevenLabs TTS API.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xxx npx tsx scripts/generate-audio.ts
 *
 * Options:
 *   --story=<id>    Generate audio for a specific story only
 *   --dry-run       Print what would be generated without calling API
 *   --voice=<id>    Override default voice (default: Rachel)
 */

import * as fs from 'fs';
import * as path from 'path';

// Inline the sleep story data extraction
// We'll read the file and extract text segments

const SLEEP_STORIES_PATH = './src/constants/sleepStories.ts';

// ElevenLabs configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Recommended voices for sleep stories
const VOICES: Record<string, string> = {
  rachel: '21m00Tcm4TlvDq8ikWAM', // Calm, soothing female
  bella: 'EXAVITQu4vr4xnSDxMaL',  // Gentle female
  adam: 'pNInz6obpgDQGcFmaJgB',   // Deep male
  antoni: 'ErXwobaYiN019PkySvjV', // Warm male
};

// Voice settings optimized for sleep content
const VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.75,
  style: 0.3,
  use_speaker_boost: false,
};

const OUTPUT_DIR = './generated-audio';

interface Story {
  id: string;
  name: string;
  texts: string[];
}

function parseStoriesFromFile(): Story[] {
  const content = fs.readFileSync(SLEEP_STORIES_PATH, 'utf-8');
  const stories: Story[] = [];

  // Split by story blocks (each starts with id: 'sleep-)
  const storyBlocks = content.split(/\{\s*id:\s*'(sleep-[^']+)'/);

  for (let i = 1; i < storyBlocks.length; i += 2) {
    const id = storyBlocks[i];
    const block = storyBlocks[i + 1] || '';

    // Extract name
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const name = nameMatch ? nameMatch[1] : id;

    // Extract all text segments
    const textMatches = block.matchAll(/text:\s*'([^']+)'/g);
    const texts = Array.from(textMatches).map((m) => m[1]);

    if (texts.length > 0) {
      stories.push({ id, name, texts });
    }
  }

  return stories;
}

function createScript(texts: string[]): string {
  // Join texts with pauses (represented by line breaks)
  return texts.join('\n\n');
}

async function generateAudio(
  text: string,
  outputPath: string,
  voiceId: string,
  apiKey: string
): Promise<void> {
  const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: VOICE_SETTINGS,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const storyFilter = args.find((a) => a.startsWith('--story='))?.split('=')[1];
  const voiceArg = args.find((a) => a.startsWith('--voice='))?.split('=')[1];

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey && !dryRun) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required');
    console.error('Usage: ELEVENLABS_API_KEY=xxx npx tsx scripts/generate-audio.ts');
    process.exit(1);
  }

  const voiceId = voiceArg ? (VOICES[voiceArg] || voiceArg) : VOICES.rachel;

  console.log('Parsing sleep stories...');
  let stories = parseStoriesFromFile();

  if (storyFilter) {
    stories = stories.filter((s) => s.id === storyFilter);
    if (stories.length === 0) {
      console.error(`Story "${storyFilter}" not found`);
      console.log('Available stories:');
      parseStoriesFromFile().forEach((s) => console.log(`  - ${s.id}`));
      process.exit(1);
    }
  }

  console.log(`Found ${stories.length} stories to process\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest: { id: string; name: string; audioFile: string; characters: number }[] = [];

  for (const story of stories) {
    const script = createScript(story.texts);
    const outputFile = `${story.id}.mp3`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    console.log(`--- ${story.name} (${story.id}) ---`);
    console.log(`Segments: ${story.texts.length}`);
    console.log(`Characters: ${script.length}`);
    console.log(`Output: ${outputPath}`);

    if (dryRun) {
      console.log('\nPreview (first 300 chars):');
      console.log(script.substring(0, 300) + '...\n');
    } else {
      console.log('Generating audio...');
      try {
        await generateAudio(script, outputPath, voiceId, apiKey!);
        console.log('Done!\n');

        manifest.push({
          id: story.id,
          name: story.name,
          audioFile: outputFile,
          characters: script.length,
        });
      } catch (error) {
        console.error(`Failed: ${error}\n`);
      }

      // Rate limiting - wait between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!dryRun && manifest.length > 0) {
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\nManifest: ${manifestPath}`);
    console.log(`Generated: ${manifest.length} stories`);
    console.log(`Total characters: ${manifest.reduce((sum, m) => sum + m.characters, 0)}`);
  }
}

main().catch(console.error);
