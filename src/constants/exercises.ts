import type { ExerciseTemplate } from '@/src/types/exercise';
import { BREATHING_TECHNIQUES } from './breathingTechniques';

/**
 * Research Citations for Wellness Exercises
 *
 * Box Breathing:
 * Ma X, Yue ZQ, Gong ZQ, et al. The Effect of Diaphragmatic Breathing on Attention,
 * Negative Affect and Stress in Healthy Adults. Front Psychol. 2017;8:874.
 *
 * Grounding Techniques:
 * Najavits LM. Seeking Safety. New York: Guilford Press; 2002.
 *
 * Gratitude Practice:
 * Emmons RA, McCullough ME. Counting blessings versus burdens.
 * J Pers Soc Psychol. 2003;84(2):377-389.
 *
 * Self-Compassion:
 * Neff KD. Self-compassion. Self and Identity. 2003;2(2):85-101.
 */

export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // Thought Record
  {
    id: 'thought-record',
    type: 'reflection',
    category: 'thought_record',
    name: 'Thought Record',
    description: 'Challenge negative thoughts by examining the evidence',
    duration: 8,
    icon: 'document-text-outline',
    color: '#6366F1',
    isPremium: true,
    steps: [
      {
        id: 'situation',
        type: 'text_input',
        title: 'Describe the Situation',
        content: 'What happened? Where were you? Who was there? Be specific about the facts.',
        placeholder: 'I was at work when my manager asked to speak with me...',
        required: true,
      },
      {
        id: 'emotions',
        type: 'text_input',
        title: 'Identify Your Emotions',
        content: 'What emotions did you feel? Try to name them specifically (anxious, sad, frustrated, etc.) and rate their intensity from 0-100.',
        placeholder: 'Anxious (80%), Worried (70%), Embarrassed (50%)...',
        required: true,
      },
      {
        id: 'automatic-thoughts',
        type: 'text_input',
        title: 'Automatic Thoughts',
        content: 'What thoughts went through your mind? What were you telling yourself?',
        placeholder: 'I must have done something wrong. I\'m going to get fired...',
        required: true,
      },
      {
        id: 'evidence-for',
        type: 'text_input',
        title: 'Evidence Supporting the Thought',
        content: 'What facts support this thought being true? Stick to observable facts, not feelings.',
        placeholder: 'My manager has called me in before when there was a problem...',
        required: true,
      },
      {
        id: 'evidence-against',
        type: 'text_input',
        title: 'Evidence Against the Thought',
        content: 'What facts go against this thought? What would you tell a friend in this situation?',
        placeholder: 'My recent performance review was positive. Managers also meet for good reasons...',
        required: true,
      },
      {
        id: 'balanced-thought',
        type: 'text_input',
        title: 'Balanced Thought',
        content: 'Based on the evidence, what\'s a more balanced way to think about this situation?',
        placeholder: 'There are many reasons my manager might want to talk. I don\'t have enough information to assume the worst...',
        required: true,
      },
    ],
  },

  // Box Breathing (FREE)
  {
    id: 'box-breathing',
    type: 'breathing',
    category: 'breathing',
    name: 'Box Breathing',
    description: 'Calm your nervous system with this simple breathing technique',
    duration: 4,
    icon: 'square-outline',
    color: '#10B981',
    isPremium: false,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'Getting Ready',
        content: 'Find a comfortable position. You can sit or lie down. Close your eyes if that feels comfortable, or soften your gaze.\n\nBox breathing is a powerful technique used by Navy SEALs and first responders to stay calm under pressure.',
        required: false,
      },
      {
        id: 'breathing',
        type: 'breathing',
        title: 'Box Breathing',
        content: 'Follow the circle. Breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, and hold for 4 seconds.',
        duration: 120, // 2 minutes of breathing
        required: true,
      },
      {
        id: 'reflection',
        type: 'text_input',
        title: 'Reflection',
        content: 'How do you feel after the breathing exercise? Notice any changes in your body or mind.',
        placeholder: 'I feel more calm and centered...',
        required: false,
      },
    ],
  },

  // 4-7-8 Relaxation Breathing (PREMIUM)
  {
    id: '4-7-8-breathing',
    type: 'breathing',
    category: 'breathing',
    name: '4-7-8 Relaxation',
    description: "Dr. Weil's breathing technique for sleep and anxiety relief",
    duration: 5,
    icon: 'moon-outline',
    color: '#6366F1',
    isPremium: true,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'The Relaxing Breath',
        content: "The 4-7-8 breathing technique was developed by Dr. Andrew Weil. It's based on an ancient yogic practice called pranayama.\n\nThis pattern acts as a natural tranquilizer for the nervous system. The longer exhale activates your body's relaxation response.",
        required: false,
      },
      {
        id: 'breathing',
        type: 'breathing',
        title: '4-7-8 Breathing',
        content: 'Breathe in for 4 seconds, hold for 7 seconds, then exhale slowly for 8 seconds.',
        duration: 180, // 3 minutes of breathing
        breathingConfig: BREATHING_TECHNIQUES['4-7-8-relaxation'],
        enableVoiceGuidance: true,
        enableHaptics: true,
        required: true,
      },
      {
        id: 'reflection',
        type: 'text_input',
        title: 'Reflection',
        content: 'How do you feel after the 4-7-8 breathing? Notice any changes in your body, especially tension release.',
        placeholder: 'I notice...',
        required: false,
      },
    ],
  },

  // Coherent Breathing (PREMIUM)
  {
    id: 'coherent-breathing',
    type: 'breathing',
    category: 'breathing',
    name: 'Coherent Breathing',
    description: 'Optimize heart rate variability with balanced 5-second rhythms',
    duration: 5,
    icon: 'pulse-outline',
    color: '#10B981',
    isPremium: true,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'Heart-Brain Harmony',
        content: "Coherent breathing at 5 breaths per minute (5 seconds in, 5 seconds out) has been shown to optimize heart rate variability (HRV).\n\nHigher HRV is associated with better stress resilience, emotional regulation, and overall health. This rhythm brings your heart and brain into sync.",
        required: false,
      },
      {
        id: 'breathing',
        type: 'breathing',
        title: 'Coherent Breathing',
        content: 'Breathe in for 5 seconds, then out for 5 seconds. Find a smooth, effortless rhythm.',
        duration: 180, // 3 minutes of breathing
        breathingConfig: BREATHING_TECHNIQUES['coherent-breathing'],
        enableVoiceGuidance: true,
        enableHaptics: true,
        required: true,
      },
      {
        id: 'reflection',
        type: 'text_input',
        title: 'Reflection',
        content: 'How does your body feel after coherent breathing? Notice your heart rate and overall sense of calm.',
        placeholder: 'My body feels...',
        required: false,
      },
    ],
  },

  // Energizing Breath (PREMIUM)
  {
    id: 'energizing-breath',
    type: 'breathing',
    category: 'breathing',
    name: 'Energizing Breath',
    description: 'Quick rhythmic breathing for energy boost and focus',
    duration: 2,
    icon: 'flash-outline',
    color: '#F59E0B',
    isPremium: true,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'Wake Up Your System',
        content: "This quick breathing exercise uses rapid, rhythmic breaths to boost your energy and alertness.\n\nUnlike calming techniques, this exercise is designed to energize. It's perfect for when you need a natural pick-me-up without caffeine.",
        required: false,
      },
      {
        id: 'breathing',
        type: 'breathing',
        title: 'Energizing Breath',
        content: 'Quick breaths: 1 second in, 1 second out. Keep the rhythm steady and strong.',
        duration: 60, // 1 minute of energizing breath
        breathingConfig: BREATHING_TECHNIQUES['energizing-breath'],
        enableVoiceGuidance: false, // Voice would be too slow for rapid breathing
        enableHaptics: true,
        required: true,
      },
      {
        id: 'reflection',
        type: 'text_input',
        title: 'Reflection',
        content: 'How do you feel now? Notice any changes in your energy level or mental clarity.',
        placeholder: 'I feel more...',
        required: false,
      },
    ],
  },

  // 5-4-3-2-1 Grounding (FREE)
  {
    id: 'grounding-54321',
    type: 'mindfulness',
    category: 'grounding',
    name: '5-4-3-2-1 Grounding',
    description: 'Ground yourself in the present moment using your senses',
    duration: 5,
    icon: 'hand-left-outline',
    color: '#F59E0B',
    isPremium: false,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'Getting Grounded',
        content: 'This exercise will help bring you back to the present moment by engaging all five of your senses.\n\nTake a deep breath and look around you. We\'ll go through each sense one at a time.',
        required: false,
      },
      {
        id: 'see',
        type: 'multi_input',
        title: '5 Things You Can See',
        content: 'Look around and name 5 things you can see right now. They can be anything - a plant, a light, a texture on the wall.',
        inputCount: 5,
        inputLabels: ['1', '2', '3', '4', '5'],
        placeholder: 'e.g., A blue coffee mug',
        required: true,
      },
      {
        id: 'touch',
        type: 'multi_input',
        title: '4 Things You Can Touch',
        content: 'Notice 4 things you can physically feel right now. The chair beneath you, your feet on the floor, the air on your skin.',
        inputCount: 4,
        inputLabels: ['1', '2', '3', '4'],
        placeholder: 'e.g., The smooth surface of my desk',
        required: true,
      },
      {
        id: 'hear',
        type: 'multi_input',
        title: '3 Things You Can Hear',
        content: 'Listen carefully. What 3 sounds can you hear? Near or far, loud or soft.',
        inputCount: 3,
        inputLabels: ['1', '2', '3'],
        placeholder: 'e.g., Birds chirping outside',
        required: true,
      },
      {
        id: 'smell',
        type: 'multi_input',
        title: '2 Things You Can Smell',
        content: 'Take a breath and notice 2 things you can smell. If you can\'t smell anything, name 2 smells you like.',
        inputCount: 2,
        inputLabels: ['1', '2'],
        placeholder: 'e.g., Fresh coffee',
        required: true,
      },
      {
        id: 'taste',
        type: 'multi_input',
        title: '1 Thing You Can Taste',
        content: 'Finally, notice 1 thing you can taste. It might be the lingering taste of your last drink or food.',
        inputCount: 1,
        inputLabels: ['1'],
        placeholder: 'e.g., Mint from my toothpaste',
        required: true,
      },
    ],
  },

  // Gratitude
  {
    id: 'gratitude-list',
    type: 'gratitude',
    category: 'gratitude',
    name: 'Gratitude Practice',
    description: 'Shift your focus to what\'s good in your life',
    duration: 3,
    icon: 'heart-outline',
    color: '#EC4899',
    isPremium: true,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'Cultivating Gratitude',
        content: 'Research shows that practicing gratitude can improve mood, sleep, and overall well-being.\n\nTake a moment to reflect on what you\'re grateful for today. It can be big things or small moments.',
        required: false,
      },
      {
        id: 'gratitude-items',
        type: 'multi_input',
        title: 'Three Gratitudes',
        content: 'What are three things you\'re grateful for right now? They can be people, experiences, things you have, or moments from your day.',
        inputCount: 3,
        inputLabels: ['First gratitude', 'Second gratitude', 'Third gratitude'],
        placeholder: 'e.g., A warm cup of tea this morning',
        required: true,
      },
      {
        id: 'why',
        type: 'text_input',
        title: 'Why It Matters',
        content: 'Pick one of your gratitudes and reflect: why is this meaningful to you?',
        placeholder: 'I\'m grateful for this because...',
        required: false,
      },
    ],
  },

  // Worry Dump
  {
    id: 'worry-dump',
    type: 'reflection',
    category: 'worry',
    name: 'Worry Dump',
    description: 'Get worries out of your head and onto paper',
    duration: 2,
    icon: 'cloud-outline',
    color: '#8B5CF6',
    isPremium: true,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'Release Your Worries',
        content: 'When worries stay in your head, they can feel overwhelming and endless. Writing them down helps externalize them and gives you perspective.\n\nThis quick exercise helps you dump out what\'s on your mind so you can see it more clearly.',
        required: false,
      },
      {
        id: 'worries',
        type: 'multi_input',
        title: 'What\'s Weighing on You?',
        content: 'Write down the worries that are taking up space in your mind right now. Don\'t filter—just get them out.',
        inputCount: 3,
        inputLabels: ['Worry 1', 'Worry 2', 'Worry 3'],
        placeholder: 'e.g., I\'m worried about the deadline tomorrow',
        required: true,
      },
      {
        id: 'control',
        type: 'text_input',
        title: 'What Can You Control?',
        content: 'Looking at your worries, what\'s one small thing within your control that you could do today?',
        placeholder: 'I can start by...',
        required: true,
      },
    ],
  },

  // Self-Compassion Break
  {
    id: 'self-compassion',
    type: 'mindfulness',
    category: 'self_compassion',
    name: 'Self-Compassion Break',
    description: 'Treat yourself with the kindness you\'d offer a friend',
    duration: 2,
    icon: 'heart-circle-outline',
    color: '#F472B6',
    isPremium: true,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'A Moment of Self-Kindness',
        content: 'When we\'re struggling, we\'re often harder on ourselves than we would be on a friend. This exercise helps you offer yourself the same compassion you\'d give to someone you care about.\n\nTake a breath and let\'s work through three simple steps.',
        required: false,
      },
      {
        id: 'acknowledge',
        type: 'text_input',
        title: 'Acknowledge the Difficulty',
        content: 'What are you struggling with right now? Name it simply, without judgment. Start with "This is hard because..." or "I\'m struggling with..."',
        placeholder: 'This is hard because...',
        required: true,
      },
      {
        id: 'common-humanity',
        type: 'text_input',
        title: 'Common Humanity',
        content: 'Remind yourself that struggle is part of being human. Others have felt this way too. Complete this thought: "I\'m not alone in this. Many people..."',
        placeholder: 'Many people also feel this way when...',
        required: true,
      },
      {
        id: 'kindness',
        type: 'text_input',
        title: 'Words of Kindness',
        content: 'What would you say to a good friend in this situation? Now say those words to yourself. What do you need to hear right now?',
        placeholder: 'I want to tell myself...',
        required: true,
      },
    ],
  },

  // Set Your Intention
  {
    id: 'quick-goal',
    type: 'reflection',
    category: 'goals',
    name: 'Set Your Intention',
    description: 'Focus on one achievable goal to build momentum',
    duration: 2,
    icon: 'flag-outline',
    color: '#22D3EE',
    isPremium: true,
    steps: [
      {
        id: 'intro',
        type: 'instruction',
        title: 'Small Steps, Big Impact',
        content: 'When we\'re feeling stuck or overwhelmed, setting one small, achievable goal can help create momentum. The key is making it specific and doable today.\n\nLet\'s identify something small you can accomplish.',
        required: false,
      },
      {
        id: 'goal',
        type: 'text_input',
        title: 'What Do You Want to Accomplish?',
        content: 'Think of one thing you\'d like to achieve. It can be related to how you\'re feeling, something you\'ve been putting off, or a small step toward a bigger goal.',
        placeholder: 'I want to...',
        required: true,
      },
      {
        id: 'first-step',
        type: 'text_input',
        title: 'The First Tiny Step',
        content: 'What\'s the smallest possible action you could take toward this goal today? Make it so small it feels almost too easy.',
        placeholder: 'The first tiny step I can take is...',
        required: true,
      },
    ],
  },
];
