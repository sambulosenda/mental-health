import type { AssessmentTemplate, LikertOption } from '@/src/types/assessment';

export const GAD7_TEMPLATE: AssessmentTemplate = {
  id: 'gad7',
  name: 'GAD-7',
  description: 'Generalized Anxiety Disorder Assessment',
  icon: 'pulse-outline',
  color: '#6366F1',
  questions: [
    { id: 'gad7_q1', text: 'Feeling nervous, anxious, or on edge', order: 1 },
    { id: 'gad7_q2', text: 'Not being able to stop or control worrying', order: 2 },
    { id: 'gad7_q3', text: 'Worrying too much about different things', order: 3 },
    { id: 'gad7_q4', text: 'Trouble relaxing', order: 4 },
    { id: 'gad7_q5', text: "Being so restless that it's hard to sit still", order: 5 },
    { id: 'gad7_q6', text: 'Becoming easily annoyed or irritable', order: 6 },
    { id: 'gad7_q7', text: 'Feeling afraid as if something awful might happen', order: 7 },
  ],
  scoringInfo: {
    maxScore: 21,
    thresholds: {
      minimal: [0, 4],
      mild: [5, 9],
      moderate: [10, 14],
      severe: [15, 21],
    },
    recommendedFrequencyDays: 7,
  },
};

export const PHQ9_TEMPLATE: AssessmentTemplate = {
  id: 'phq9',
  name: 'PHQ-9',
  description: 'Patient Health Questionnaire for Depression',
  icon: 'heart-outline',
  color: '#EC4899',
  questions: [
    { id: 'phq9_q1', text: 'Little interest or pleasure in doing things', order: 1 },
    { id: 'phq9_q2', text: 'Feeling down, depressed, or hopeless', order: 2 },
    { id: 'phq9_q3', text: 'Trouble falling or staying asleep, or sleeping too much', order: 3 },
    { id: 'phq9_q4', text: 'Feeling tired or having little energy', order: 4 },
    { id: 'phq9_q5', text: 'Poor appetite or overeating', order: 5 },
    {
      id: 'phq9_q6',
      text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
      order: 6,
    },
    {
      id: 'phq9_q7',
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      order: 7,
    },
    {
      id: 'phq9_q8',
      text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
      order: 8,
    },
    {
      id: 'phq9_q9',
      text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
      order: 9,
    },
  ],
  scoringInfo: {
    maxScore: 27,
    thresholds: {
      minimal: [0, 4],
      mild: [5, 9],
      moderate: [10, 14],
      severe: [15, 27],
    },
    recommendedFrequencyDays: 14,
  },
};

export const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [GAD7_TEMPLATE, PHQ9_TEMPLATE];

export const LIKERT_OPTIONS: LikertOption[] = [
  { value: 0, label: 'Not at all', shortLabel: '0' },
  { value: 1, label: 'Several days', shortLabel: '1' },
  { value: 2, label: 'More than half the days', shortLabel: '2' },
  { value: 3, label: 'Nearly every day', shortLabel: '3' },
];

export const SEVERITY_CONFIG = {
  minimal: {
    label: 'Minimal',
    color: '#10B981',
    bgColor: '#D1FAE5',
    darkBgColor: '#10B98130',
  },
  mild: {
    label: 'Mild',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    darkBgColor: '#F59E0B30',
  },
  moderate: {
    label: 'Moderate',
    color: '#F97316',
    bgColor: '#FFEDD5',
    darkBgColor: '#F9731630',
  },
  severe: {
    label: 'Severe',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    darkBgColor: '#EF444430',
  },
} as const;

export function getTemplateById(type: 'gad7' | 'phq9'): AssessmentTemplate {
  return type === 'gad7' ? GAD7_TEMPLATE : PHQ9_TEMPLATE;
}

export function calculateSeverity(
  score: number,
  template: AssessmentTemplate
): 'minimal' | 'mild' | 'moderate' | 'severe' {
  const { thresholds } = template.scoringInfo;

  if (score >= thresholds.severe[0]) return 'severe';
  if (score >= thresholds.moderate[0]) return 'moderate';
  if (score >= thresholds.mild[0]) return 'mild';
  return 'minimal';
}
