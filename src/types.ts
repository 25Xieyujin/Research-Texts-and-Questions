export interface NASA_TLX {
  fluency: number; // 1-7
  cognitiveLoad: number; // 1-7
  trust: number; // 1-7
}

export interface QuestionResponse {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  type: 'comprehension' | 'inference' | 'critical';
}

export interface TextResponse {
  topicId: string;
  textType: 'ai' | 'human';
  nasaTlx: NASA_TLX;
  answers: QuestionResponse[];
}

export interface SurveyResult {
  id?: string;
  participantId: string;
  timestamp: any; // Firestore Timestamp
  responses: TextResponse[];
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  type: 'comprehension' | 'inference' | 'critical';
}

export interface TopicText {
  id: string;
  title: string;
  content: string;
  type: 'ai' | 'human';
}

export interface Topic {
  id: string;
  title: string;
  texts: {
    ai: TopicText;
    human: TopicText;
  };
  questions: Question[];
}
