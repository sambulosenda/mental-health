/**
 * ElevenLabs Meditation Audio Generation Script
 *
 * Generates audio files for guided meditations using ElevenLabs TTS API.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=xxx npx tsx scripts/generate-meditation-audio.ts
 *
 * Options:
 *   --meditation=<id>  Generate audio for a specific meditation only
 *   --dry-run          Print what would be generated without calling API
 *   --voice=<id>       Override default voice (default: rachel)
 *
 * After generation, upload files to R2 CDN at /meditations/
 */

import * as fs from 'fs';
import * as path from 'path';

// ElevenLabs configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Recommended voices for meditation - calm and soothing
const VOICES: Record<string, string> = {
  rachel: '21m00Tcm4TlvDq8ikWAM', // Calm, soothing female
  bella: 'EXAVITQu4vr4xnSDxMaL',  // Gentle female
  adam: 'pNInz6obpgDQGcFmaJgB',   // Deep male
  antoni: 'ErXwobaYiN019PkySvjV', // Warm male
};

// Voice settings optimized for meditation content
const VOICE_SETTINGS = {
  stability: 0.80,          // High stability for calm, consistent delivery
  similarity_boost: 0.75,
  style: 0.25,              // Low style for peaceful delivery
  use_speaker_boost: false,
};

const OUTPUT_DIR = './generated-audio/meditations';

interface SpeechSegment {
  text: string;
  pauseAfter: number;
  breathCue?: boolean;
}

interface MeditationStep {
  id: string;
  type: string;
  title: string;
  speechSegments?: SpeechSegment[];
}

interface Meditation {
  id: string;
  name: string;
  duration: number;
  steps: MeditationStep[];
}

// Meditation data extracted from meditations.ts
// Only including meditations that have timed_speech steps
const MEDITATIONS: Meditation[] = [
  {
    id: 'breath-awareness-5min',
    name: 'Breath Awareness',
    duration: 5,
    steps: [
      {
        id: 'intro',
        type: 'timed_speech',
        title: 'Finding Your Center',
        speechSegments: [
          { text: 'Find a comfortable position.', pauseAfter: 3 },
          { text: 'Gently close your eyes, or soften your gaze.', pauseAfter: 4 },
          { text: 'Take a deep breath in.', pauseAfter: 4, breathCue: true },
          { text: 'And slowly let it go.', pauseAfter: 4, breathCue: true },
          { text: 'Allow your breathing to return to its natural rhythm.', pauseAfter: 3 },
        ],
      },
      {
        id: 'main',
        type: 'timed_speech',
        title: 'Breath Awareness',
        speechSegments: [
          { text: 'Now, bring your attention to your breath.', pauseAfter: 5 },
          { text: 'Notice the sensation of air entering your body.', pauseAfter: 8 },
          { text: 'Feel your chest and belly gently rise.', pauseAfter: 8 },
          { text: 'And then fall as you exhale.', pauseAfter: 8 },
          { text: 'There is nothing to change or fix.', pauseAfter: 5 },
          { text: 'Simply observe your breath as it is.', pauseAfter: 10 },
          { text: 'If your mind wanders, that is perfectly normal.', pauseAfter: 5 },
          { text: 'Gently guide your attention back to the breath.', pauseAfter: 10 },
          { text: 'Notice the pause between inhale and exhale.', pauseAfter: 8 },
          { text: 'And the pause between exhale and inhale.', pauseAfter: 10 },
          { text: 'Continue breathing naturally.', pauseAfter: 15 },
          { text: 'Each breath anchoring you to this moment.', pauseAfter: 15 },
        ],
      },
      {
        id: 'closing',
        type: 'timed_speech',
        title: 'Returning',
        speechSegments: [
          { text: 'Begin to bring your awareness back to the room.', pauseAfter: 4 },
          { text: 'Notice any sounds around you.', pauseAfter: 4 },
          { text: 'Wiggle your fingers and toes.', pauseAfter: 3 },
          { text: 'When you are ready, gently open your eyes.', pauseAfter: 4 },
          { text: 'Carry this sense of calm with you.', pauseAfter: 2 },
        ],
      },
    ],
  },
  {
    id: 'body-scan-10min',
    name: 'Body Scan',
    duration: 10,
    steps: [
      {
        id: 'intro',
        type: 'timed_speech',
        title: 'Settling In',
        speechSegments: [
          { text: 'Lie down or sit comfortably.', pauseAfter: 3 },
          { text: 'Close your eyes and take three deep breaths.', pauseAfter: 8, breathCue: true },
          { text: 'Allow your body to feel heavy and supported.', pauseAfter: 5 },
        ],
      },
      {
        id: 'scan',
        type: 'timed_speech',
        title: 'Body Scan',
        speechSegments: [
          { text: 'Bring your attention to the top of your head.', pauseAfter: 6 },
          { text: 'Notice any sensations there. Tingling, warmth, or nothing at all.', pauseAfter: 8 },
          { text: 'Now move your awareness to your forehead.', pauseAfter: 5 },
          { text: 'Let any tension soften and release.', pauseAfter: 8 },
          { text: 'Bring attention to your eyes and cheeks.', pauseAfter: 6 },
          { text: 'Relax the muscles around your eyes.', pauseAfter: 8 },
          { text: 'Notice your jaw. Let it unclench and soften.', pauseAfter: 8 },
          { text: 'Move awareness down to your neck and shoulders.', pauseAfter: 6 },
          { text: 'These areas often hold tension. Let them relax.', pauseAfter: 10 },
          { text: 'Feel your arms, from shoulders to fingertips.', pauseAfter: 8 },
          { text: 'Notice any sensations. Allow them to be.', pauseAfter: 10 },
          { text: 'Bring attention to your chest.', pauseAfter: 5 },
          { text: 'Feel it rise and fall with each breath.', pauseAfter: 10 },
          { text: 'Move awareness to your belly.', pauseAfter: 5 },
          { text: 'Let it be soft and relaxed.', pauseAfter: 10 },
          { text: 'Notice your lower back and hips.', pauseAfter: 6 },
          { text: 'Release any holding or gripping.', pauseAfter: 10 },
          { text: 'Feel your legs, from thighs to toes.', pauseAfter: 8 },
          { text: 'Let them feel heavy and grounded.', pauseAfter: 10 },
          { text: 'Now feel your whole body as one.', pauseAfter: 6 },
          { text: 'Breathing. Present. At ease.', pauseAfter: 15 },
        ],
      },
      {
        id: 'closing',
        type: 'timed_speech',
        title: 'Awakening',
        speechSegments: [
          { text: 'Slowly begin to deepen your breath.', pauseAfter: 5 },
          { text: 'Gently move your fingers and toes.', pauseAfter: 4 },
          { text: 'Stretch if it feels good.', pauseAfter: 4 },
          { text: 'When ready, open your eyes.', pauseAfter: 3 },
        ],
      },
    ],
  },
  {
    id: 'sleep-relaxation',
    name: 'Sleep Relaxation',
    duration: 12,
    steps: [
      {
        id: 'intro',
        type: 'timed_speech',
        title: 'Preparing for Sleep',
        speechSegments: [
          { text: 'Settle into your bed.', pauseAfter: 4 },
          { text: 'Close your eyes.', pauseAfter: 3 },
          { text: 'Take a slow, deep breath in.', pauseAfter: 5, breathCue: true },
          { text: 'And let it all go.', pauseAfter: 5, breathCue: true },
          { text: 'Let the day fade away.', pauseAfter: 5 },
          { text: 'This moment is for rest.', pauseAfter: 5 },
        ],
      },
      {
        id: 'relaxation',
        type: 'timed_speech',
        title: 'Deep Relaxation',
        speechSegments: [
          { text: 'Feel your body sinking into the mattress.', pauseAfter: 8 },
          { text: 'Let your head feel heavy on the pillow.', pauseAfter: 8 },
          { text: 'Release your shoulders.', pauseAfter: 6 },
          { text: 'Let them drop away from your ears.', pauseAfter: 8 },
          { text: 'Your arms are heavy. Your hands are soft.', pauseAfter: 10 },
          { text: 'Feel your back melting into the bed.', pauseAfter: 10 },
          { text: 'Your legs are relaxed. Your feet are still.', pauseAfter: 10 },
          { text: 'Your whole body is supported.', pauseAfter: 8 },
          { text: 'Nothing to do. Nowhere to go.', pauseAfter: 10 },
          { text: 'Just rest.', pauseAfter: 15 },
        ],
      },
      {
        id: 'drift',
        type: 'timed_speech',
        title: 'Drifting Off',
        speechSegments: [
          { text: 'Imagine a warm wave of relaxation.', pauseAfter: 8 },
          { text: 'It starts at the top of your head.', pauseAfter: 8 },
          { text: 'Slowly flowing down through your body.', pauseAfter: 10 },
          { text: 'Washing away any remaining tension.', pauseAfter: 10 },
          { text: 'You are safe. You are calm.', pauseAfter: 10 },
          { text: 'Let yourself drift.', pauseAfter: 15 },
          { text: 'Into peaceful sleep.', pauseAfter: 20 },
        ],
      },
    ],
  },
  {
    id: 'calming-anxiety',
    name: 'Calming Anxiety',
    duration: 7,
    steps: [
      {
        id: 'grounding',
        type: 'timed_speech',
        title: 'Grounding',
        speechSegments: [
          { text: 'Wherever you are, pause for a moment.', pauseAfter: 4 },
          { text: 'Place your feet firmly on the ground.', pauseAfter: 4 },
          { text: 'Feel the solid earth beneath you.', pauseAfter: 5 },
          { text: 'You are here. You are safe.', pauseAfter: 5 },
          { text: 'Take a deep breath in through your nose.', pauseAfter: 5, breathCue: true },
          { text: 'And slowly release it through your mouth.', pauseAfter: 5, breathCue: true },
          { text: 'Let go of what you cannot control.', pauseAfter: 6 },
        ],
      },
      {
        id: 'calming',
        type: 'timed_speech',
        title: 'Finding Calm',
        speechSegments: [
          { text: 'Anxiety is just energy in your body.', pauseAfter: 5 },
          { text: 'It cannot hurt you. It will pass.', pauseAfter: 6 },
          { text: 'Notice where you feel it most.', pauseAfter: 6 },
          { text: 'Breathe into that space.', pauseAfter: 6, breathCue: true },
          { text: 'Imagine each exhale releasing tension.', pauseAfter: 8 },
          { text: 'Your body knows how to calm itself.', pauseAfter: 6 },
          { text: 'Trust this process.', pauseAfter: 8 },
          { text: 'With each breath, you feel more at ease.', pauseAfter: 8 },
          { text: 'More grounded. More present.', pauseAfter: 8 },
          { text: 'You are doing well.', pauseAfter: 10 },
        ],
      },
      {
        id: 'affirmation',
        type: 'timed_speech',
        title: 'Affirmation',
        speechSegments: [
          { text: 'Repeat silently if it helps.', pauseAfter: 3 },
          { text: 'I am safe in this moment.', pauseAfter: 5 },
          { text: 'I can handle whatever comes.', pauseAfter: 5 },
          { text: 'This feeling is temporary.', pauseAfter: 5 },
          { text: 'I am stronger than my anxiety.', pauseAfter: 5 },
          { text: 'Take one more deep breath.', pauseAfter: 5, breathCue: true },
          { text: 'You are ready to continue your day.', pauseAfter: 3 },
        ],
      },
    ],
  },
  {
    id: 'grounding-meditation',
    name: 'Grounding Practice',
    duration: 5,
    steps: [
      {
        id: 'senses',
        type: 'timed_speech',
        title: '5-4-3-2-1 Grounding',
        speechSegments: [
          { text: 'Let us ground ourselves using our senses.', pauseAfter: 4 },
          { text: 'First, notice five things you can see.', pauseAfter: 10 },
          { text: 'Look around slowly. Name them in your mind.', pauseAfter: 12 },
          { text: 'Now, four things you can touch or feel.', pauseAfter: 8 },
          { text: 'The texture of your clothes. The air on your skin.', pauseAfter: 10 },
          { text: 'Three things you can hear.', pauseAfter: 8 },
          { text: 'Listen carefully. Near and far sounds.', pauseAfter: 10 },
          { text: 'Two things you can smell.', pauseAfter: 8 },
          { text: 'Or imagine two comforting scents.', pauseAfter: 8 },
          { text: 'And one thing you can taste.', pauseAfter: 6 },
          { text: 'Or one positive thing about yourself.', pauseAfter: 8 },
        ],
      },
      {
        id: 'close',
        type: 'timed_speech',
        title: 'Centered',
        speechSegments: [
          { text: 'Take a breath.', pauseAfter: 4, breathCue: true },
          { text: 'You are here. You are present.', pauseAfter: 4 },
          { text: 'You are grounded in this moment.', pauseAfter: 4 },
        ],
      },
    ],
  },
];

/**
 * Creates a script for ElevenLabs with SSML-like pauses
 * Uses line breaks to create natural pauses
 */
function createScript(meditation: Meditation): string {
  const segments: string[] = [];

  for (const step of meditation.steps) {
    if (step.speechSegments) {
      for (const segment of step.speechSegments) {
        // Add the text
        segments.push(segment.text);

        // Add pause markers (ElevenLabs handles natural pauses with periods and line breaks)
        // For longer pauses, we add additional line breaks
        const pauseSeconds = segment.pauseAfter;
        if (pauseSeconds >= 10) {
          segments.push('\n\n\n'); // Long pause
        } else if (pauseSeconds >= 5) {
          segments.push('\n\n');   // Medium pause
        } else {
          segments.push('\n');     // Short pause
        }
      }
    }
  }

  return segments.join('').trim();
}

function calculateCharacters(meditation: Meditation): number {
  let total = 0;
  for (const step of meditation.steps) {
    if (step.speechSegments) {
      for (const segment of step.speechSegments) {
        total += segment.text.length;
      }
    }
  }
  return total;
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
  const meditationFilter = args.find((a) => a.startsWith('--meditation='))?.split('=')[1];
  const voiceArg = args.find((a) => a.startsWith('--voice='))?.split('=')[1];

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey && !dryRun) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required');
    console.error('Usage: ELEVENLABS_API_KEY=xxx npx tsx scripts/generate-meditation-audio.ts');
    process.exit(1);
  }

  const voiceId = voiceArg ? (VOICES[voiceArg] || voiceArg) : VOICES.rachel;

  console.log('Generating meditation audio files...\n');
  console.log(`Voice: ${voiceArg || 'rachel'}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  let meditations = MEDITATIONS;

  if (meditationFilter) {
    meditations = meditations.filter((m) => m.id === meditationFilter);
    if (meditations.length === 0) {
      console.error(`Meditation "${meditationFilter}" not found`);
      console.log('Available meditations:');
      MEDITATIONS.forEach((m) => console.log(`  - ${m.id}`));
      process.exit(1);
    }
  }

  console.log(`Found ${meditations.length} meditations to process\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest: { id: string; name: string; audioFile: string; characters: number; duration: number }[] = [];

  for (const meditation of meditations) {
    const script = createScript(meditation);
    const characters = calculateCharacters(meditation);
    const outputFile = `${meditation.id}.mp3`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    console.log(`--- ${meditation.name} (${meditation.id}) ---`);
    console.log(`Duration: ${meditation.duration} min`);
    console.log(`Characters: ${characters}`);
    console.log(`Output: ${outputPath}`);

    if (dryRun) {
      console.log('\nScript preview (first 400 chars):');
      console.log(script.substring(0, 400).replace(/\n/g, '\\n') + '...\n');
    } else {
      console.log('Generating audio...');
      try {
        await generateAudio(script, outputPath, voiceId, apiKey!);
        console.log('Done!\n');

        manifest.push({
          id: meditation.id,
          name: meditation.name,
          audioFile: outputFile,
          characters,
          duration: meditation.duration,
        });
      } catch (error) {
        console.error(`Failed: ${error}\n`);
      }

      // Rate limiting - wait between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!dryRun && manifest.length > 0) {
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('\n--- Summary ---');
    console.log(`Manifest: ${manifestPath}`);
    console.log(`Generated: ${manifest.length} meditations`);
    console.log(`Total characters: ${manifest.reduce((sum, m) => sum + m.characters, 0)}`);
    console.log(`\nNext steps:`);
    console.log(`1. Upload files from ${OUTPUT_DIR}/ to R2 CDN at /meditations/`);
    console.log(`2. Update cdnConfig.ts to add meditation audio paths`);
    console.log(`3. Create meditationVoice.ts service similar to breathingVoice.ts`);
  }
}

main().catch(console.error);
