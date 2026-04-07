export interface Demographics {
  age: string;
  gender: string;
  raceEthnicity: string;
}

export interface Problem {
  category: 'EVIDENCE' | 'LOGIC' | 'ASSUMPTION' | 'SCOPE' | 'MISSING_INFO' | 'VAGUE';
  reason: string;
}

export interface Annotation {
  id?: string;
  assessmentId: string;
  userId: string;
  textId: string;
  sentenceId: string;
  textSpan: string;
  problems: Problem[];
  createdAt: any;
  updatedAt: any;
}

export interface Sentence {
  id: string;
  text: string;
}

export interface TextContent {
  id: string;
  topic: string;
  version: 'A' | 'B' | 'C';
  content: string;
  sentences: Sentence[];
}

export interface Scores {
  L1: number;
  L2: number;
  L3: number;
  L4: number;
}

export interface Question {
  id: string;
  textId: string;
  type: 'MC' | 'CLICK_SENTENCE' | 'CLICK_PAIR';
  instruction: string;
  options?: string[];
  correctAnswer?: number | string | string[];
  reasoning: string;
  requiresReason?: boolean;
}

export interface Answer {
  value: any; // index for MC, string[] for CLICK
  reason?: string;
}

export interface Assessment {
  id?: string;
  userId: string;
  textId: string;
  textVersion: string;
  answers: Answer[];
  scores: Scores;
  totalScore: number;
  thinkingLevel: 'Developing' | 'Proficient' | 'Advanced';
  submittedAt: any;
  demographics: Demographics;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}
