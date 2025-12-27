import { InstructionStep } from './steps/InstructionStep';
import { TextInputStep } from './steps/TextInputStep';
import { MoodSelectStep } from './steps/MoodSelectStep';
import { MultiInputStep } from './steps/MultiInputStep';
import { BreathingStep } from './steps/BreathingStep';
import { TimedSpeechStep } from './steps/TimedSpeechStep';
import { MeditationTimerStep } from './steps/MeditationTimerStep';
import { AudioSleepStep } from './steps/AudioSleepStep';
import { AudioMeditationStep } from './steps/AudioMeditationStep';
import { hasMeditationAudio } from '@/src/lib/meditation/meditationVoice';
import type { ExerciseStep as ExerciseStepType, MoodValue } from '@/src/types/exercise';

interface ExerciseStepProps {
  step: ExerciseStepType;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onBreathingComplete?: () => void;
  accentColor?: string;
  templateId?: string;
}

// For mood steps (before/after)
interface MoodStepProps {
  type: 'mood_before' | 'mood_after';
  selectedMood: MoodValue | null;
  onSelectMood: (mood: MoodValue) => void;
}

export function ExerciseStepRenderer({
  step,
  value,
  onChange,
  onBreathingComplete,
  accentColor,
  templateId,
}: ExerciseStepProps) {
  switch (step.type) {
    case 'instruction':
      return <InstructionStep step={step} accentColor={accentColor} />;

    case 'text_input':
    case 'reflection':
      return (
        <TextInputStep
          step={step}
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(v)}
          accentColor={accentColor}
        />
      );

    case 'multi_input':
      return (
        <MultiInputStep
          step={step}
          values={Array.isArray(value) ? value : []}
          onChange={(v) => onChange(v)}
          accentColor={accentColor}
        />
      );

    case 'breathing':
      return (
        <BreathingStep
          step={step}
          onComplete={onBreathingComplete || (() => {})}
          accentColor={accentColor}
        />
      );

    case 'timed_speech':
      // Use pre-recorded audio if available for this meditation
      if (templateId && hasMeditationAudio(templateId)) {
        return (
          <AudioMeditationStep
            step={step}
            meditationId={templateId}
            onComplete={onBreathingComplete || (() => {})}
            accentColor={accentColor}
          />
        );
      }
      return (
        <TimedSpeechStep
          step={step}
          onComplete={onBreathingComplete || (() => {})}
          accentColor={accentColor}
        />
      );

    case 'meditation_timer':
      return (
        <MeditationTimerStep
          step={step}
          onComplete={onBreathingComplete || (() => {})}
          accentColor={accentColor}
        />
      );

    case 'guided_visual':
      // For now, use TimedSpeechStep for guided_visual as well
      return (
        <TimedSpeechStep
          step={step}
          onComplete={onBreathingComplete || (() => {})}
          accentColor={accentColor}
        />
      );

    case 'audio_story':
      return (
        <AudioSleepStep
          step={step}
          onComplete={onBreathingComplete || (() => {})}
          accentColor={accentColor}
        />
      );

    default:
      return null;
  }
}

export function MoodStepRenderer({ type, selectedMood, onSelectMood }: MoodStepProps) {
  if (type === 'mood_before') {
    return (
      <MoodSelectStep
        title="How are you feeling?"
        subtitle="Before we begin, let's check in with how you're doing right now."
        selectedMood={selectedMood}
        onSelectMood={onSelectMood}
      />
    );
  }

  return (
    <MoodSelectStep
      title="How do you feel now?"
      subtitle="Take a moment to notice any changes after completing the exercise."
      selectedMood={selectedMood}
      onSelectMood={onSelectMood}
    />
  );
}
