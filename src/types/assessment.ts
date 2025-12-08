export type AssessmentType = 'gad7' | 'phq9';

export type LikertValue = 0 | 1 | 2 | 3;

export type SeverityLevel = 'minimal' | 'mild' | 'moderate' | 'severe';

export interface AssessmentQuestion {
  id: string;
  text: string;
  order: number;
}

export interface ScoringThresholds {
  minimal: [number, number];
  mild: [number, number];
  moderate: [number, number];
  severe: [number, number];
}

export interface AssessmentTemplate {
  id: AssessmentType;
  name: string;
  description: string;
  questions: AssessmentQuestion[];
  scoringInfo: {
    maxScore: number;
    thresholds: ScoringThresholds;
    recommendedFrequencyDays: number;
  };
  icon: string;
  color: string;
}

export interface AssessmentSession {
  id: string;
  type: AssessmentType;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  responses: Record<string, LikertValue>;
  totalScore?: number;
  severity?: SeverityLevel;
}

export interface AssessmentFlow {
  template: AssessmentTemplate;
  currentQuestionIndex: number;
  responses: Record<string, LikertValue>;
}

export interface LikertOption {
  value: LikertValue;
  label: string;
  shortLabel: string;
}
