export interface User {
  id: string;
  email: string;
  role: 'recruiter' | 'candidate';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  confirmPassword: string;
}

export type InterviewType = 'system-design' | 'technical' | 'behavioral';

export interface Interview {
  id: string;
  problemId: string;
  candidateEmail: string;
  type: InterviewType;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
  score?: number;
}

export interface SystemDesignComponent {
  id: string;
  type: 'api-gateway' | 'database' | 'service' | 'object-storage' | 'cdn' | 'queue' | 'cache';
  position: { x: number; y: number };
  label?: string;
}

export interface SystemDesignConnection {
  id: string;
  source: string;
  target: string;
}

export interface SystemDesignDiagram {
  components: SystemDesignComponent[];
  connections: SystemDesignConnection[];
  timestamp: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  type: InterviewType;
  difficulty: 'easy' | 'medium' | 'hard';
  perfectSolution?: string;
  exampleSolutions?: string[];
}

export interface InterviewResult {
  id: string;
  interviewId: string;
  candidateEmail: string;
  type: InterviewType;
  score: number;
  feedback: string;
  transcript?: string;
  diagrams?: SystemDesignDiagram[];
  videoRecordingUrl?: string;
  completedAt: string;
}

export interface RadarChartData {
  category: string;
  score: number;
  fullMark: number;
}

export interface ProctoringData {
  eyeTrackingEvents: EyeTrackingEvent[];
  videoRecordingUrl: string;
  audioRecordingUrl: string;
  flaggedEvents: FlaggedEvent[];
}

export interface EyeTrackingEvent {
  timestamp: number;
  lookingAway: boolean;
  duration?: number;
}

export interface FlaggedEvent {
  timestamp: number;
  type: 'eye-tracking' | 'audio-anomaly' | 'multiple-faces' | 'no-face';
  severity: 'low' | 'medium' | 'high';
  description: string;
}
