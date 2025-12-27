/**
 * ElevenLabs Audio Generation Script
 *
 * Generates audio files for all sleep stories using ElevenLabs TTS API.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xxx npx ts-node scripts/generate-audio.ts
 *
 * Options:
 *   --story=<id>    Generate audio for a specific story only
 *   --dry-run       Print what would be generated without calling API
 *   --voice=<id>    Override default voice (default: Rachel)
 */

import * as fs from 'fs';
import * as path from 'path';

// Import sleep story templates
// Note: This assumes the script is run from project root
const SLEEP_STORIES_PATH = './src/constants/sleepStories.ts';

interface SpeechSegment {
  text: string;
  pauseAfter: number;
  breathCue?: boolean;
}

interface ExerciseStep {
  id: string;
  type: string;
  title: string;
  content: string;
  speechSegments?: SpeechSegment[];
}

interface SleepStory {
  id: string;
  name: string;
  description: string;
  duration: number;
  steps: ExerciseStep[];
}

// ElevenLabs configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Recommended voices for sleep stories
const VOICES = {
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

function extractScriptFromStory(story: SleepStory): string {
  const segments: string[] = [];

  for (const step of story.steps) {
    if (step.speechSegments && step.speechSegments.length > 0) {
      for (const segment of step.speechSegments) {
        // Add the text
        segments.push(segment.text);

        // Add pause markers (ElevenLabs will interpret these)
        if (segment.pauseAfter > 0) {
          // Use SSML-like pause notation
          // ElevenLabs handles natural pauses, but we add periods for longer pauses
          if (segment.pauseAfter >= 10) {
            segments.push('...');
          } else if (segment.pauseAfter >= 5) {
            segments.push('..');
          }
        }
      }
    }
  }

  return segments.join('\n\n');
}

function parseSleepStories(): SleepStory[] {
  // Read the TypeScript file as text
  const content = fs.readFileSync(SLEEP_STORIES_PATH, 'utf-8');

  // Simple extraction - find all story objects
  // This is a basic parser; for production, consider using a proper TS parser
  const stories: SleepStory[] = [];

  // Match story IDs and extract basic info
  const idMatches = content.matchAll(/id:\s*['"]([^'"]+)['"]/g);
  const nameMatches = content.matchAll(/name:\s*['"]([^'"]+)['"]/g);

  const ids = Array.from(idMatches).map((m) => m[1]);
  const names = Array.from(nameMatches).map((m) => m[1]);

  // For each story ID, extract the full script
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const name = names[i] || id;

    // Find all text segments for this story
    const storyMatch = content.match(
      new RegExp(`id:\\s*['"]${id}['"][\\s\\S]*?(?=\\{\\s*id:|$)`, 'm')
    );

    if (storyMatch) {
      const storyContent = storyMatch[0];
      const textMatches = storyContent.matchAll(/text:\s*['"]([^'"]+)['"]/g);
      const texts = Array.from(textMatches).map((m) => m[1]);

      if (texts.length > 0) {
        stories.push({
          id,
          name,
          description: '',
          duration: 15,
          steps: [
            {
              id: 'combined',
              type: 'timed_speech',
              title: name,
              content: '',
              speechSegments: texts.map((text) => ({
                text,
                pauseAfter: 5,
              })),
            },
          ],
        });
      }
    }
  }

  return stories;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const storyFilter = args.find((a) => a.startsWith('--story='))?.split('=')[1];
  const voiceArg = args.find((a) => a.startsWith('--voice='))?.split('=')[1];

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey && !dryRun) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required');
    console.error('Usage: ELEVENLABS_API_KEY=xxx npx ts-node scripts/generate-audio.ts');
    process.exit(1);
  }

  const voiceId = voiceArg ? VOICES[voiceArg as keyof typeof VOICES] || voiceArg : VOICES.rachel;

  console.log('Parsing sleep stories...');
  const stories = parseSleepStories();

  if (storyFilter) {
    const filtered = stories.filter((s) => s.id === storyFilter);
    if (filtered.length === 0) {
      console.error(`Story "${storyFilter}" not found`);
      process.exit(1);
    }
    stories.length = 0;
    stories.push(...filtered);
  }

  console.log(`Found ${stories.length} stories to process`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest: { id: string; name: string; audioFile: string; characters: number }[] = [];

  for (const story of stories) {
    const script = extractScriptFromStory(story);
    const outputFile = `${story.id}.mp3`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    console.log(`\n--- ${story.name} (${story.id}) ---`);
    console.log(`Characters: ${script.length}`);
    console.log(`Output: ${outputPath}`);

    if (dryRun) {
      console.log('Preview (first 200 chars):');
      console.log(script.substring(0, 200) + '...');
    } else {
      console.log('Generating audio...');
      try {
        await generateAudio(script, outputPath, voiceId, apiKey!);
        console.log('Done!');

        manifest.push({
          id: story.id,
          name: story.name,
          audioFile: outputFile,
          characters: script.length,
        });
      } catch (error) {
        console.error(`Failed to generate audio for ${story.id}:`, error);
      }

      // Rate limiting - wait between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!dryRun && manifest.length > 0) {
    // Write manifest file for CDN upload reference
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\nManifest written to ${manifestPath}`);
    console.log(`\nTotal stories generated: ${manifest.length}`);
    console.log(`Total characters: ${manifest.reduce((sum, m) => sum + m.characters, 0)}`);
  }
}

main().catch(console.error);
