/**
 * ElevenLabs Breathing Cue Audio Generation Script
 *
 * Generates short audio cues for guided breathing exercises.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xxx npx tsx scripts/generate-breathing-cues.ts
 *
 * Options:
 *   --dry-run       Print what would be generated without calling API
 *   --voice=<id>    Override default voice (default: rachel)
 *
 * After generation, upload files to R2 CDN at /breathing-cues/
 */

import * as fs from 'fs';
import * as path from 'path';

// ElevenLabs configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Recommended voices - calm and soothing
const VOICES: Record<string, string> = {
  rachel: '21m00Tcm4TlvDq8ikWAM', // Calm, soothing female
  bella: 'EXAVITQu4vr4xnSDxMaL',  // Gentle female
  adam: 'pNInz6obpgDQGcFmaJgB',   // Deep male
};

// Voice settings optimized for calm breathing cues
const VOICE_SETTINGS = {
  stability: 0.85,          // Higher stability for consistent short cues
  similarity_boost: 0.75,
  style: 0.2,               // Lower style for calmer delivery
  use_speaker_boost: false,
};

const OUTPUT_DIR = './generated-audio/breathing-cues';

// Breathing cues to generate
const BREATHING_CUES = [
  { id: 'breathe-in', text: 'Breathe in' },
  { id: 'breathe-in-slowly', text: 'Breathe in slowly' },
  { id: 'hold', text: 'Hold' },
  { id: 'breathe-out', text: 'Breathe out' },
  { id: 'release-slowly', text: 'Release slowly' },
  { id: 'in', text: 'In' },
  { id: 'out', text: 'Out' },
];

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
  const voiceArg = args.find((a) => a.startsWith('--voice='))?.split('=')[1];

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey && !dryRun) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required');
    console.error('Usage: ELEVENLABS_API_KEY=xxx npx tsx scripts/generate-breathing-cues.ts');
    process.exit(1);
  }

  const voiceId = voiceArg ? (VOICES[voiceArg] || voiceArg) : VOICES.rachel;

  console.log('Generating breathing cue audio files...\n');
  console.log(`Voice: ${voiceArg || 'rachel'}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const generated: string[] = [];

  for (const cue of BREATHING_CUES) {
    const outputFile = `${cue.id}.mp3`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    console.log(`[${cue.id}] "${cue.text}"`);

    if (dryRun) {
      console.log(`  -> Would generate: ${outputPath}\n`);
    } else {
      try {
        await generateAudio(cue.text, outputPath, voiceId, apiKey!);
        console.log(`  -> Generated: ${outputPath}\n`);
        generated.push(cue.id);
      } catch (error) {
        console.error(`  -> Failed: ${error}\n`);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!dryRun && generated.length > 0) {
    console.log('\n--- Summary ---');
    console.log(`Generated: ${generated.length}/${BREATHING_CUES.length} files`);
    console.log(`\nNext steps:`);
    console.log(`1. Upload files from ${OUTPUT_DIR}/ to R2 CDN at /breathing-cues/`);
    console.log(`2. Test in app by starting a breathing exercise with voice enabled`);
  }
}

main().catch(console.error);
