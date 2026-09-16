export type InterviewTrack = 'BEHAVIORAL' | 'TECHNICAL' | 'MIXED';
export type SessionLength = 'QUICK' | 'STANDARD' | 'FULL';
export type PracticeMode = 'INSTANT_FEEDBACK' | 'EXAM';
export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type InputModality = 'TEXT' | 'VOICE';

export interface TurnFeedbackData {
  id: string;
  responseId: string;
  starSituationScore: number;
  starSituationNotes?: string;
  starTaskScore: number;
  starTaskNotes?: string;
  starActionScore: number;
  starActionNotes?: string;
  starResultScore: number;
  starResultNotes?: string;
  impactScore: number;
  clarityScore: number;
  powerVerbsUsed: string[];
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export interface InterviewResponseData {
  id: string;
  questionId: string;
  responseText: string;
  inputModality: InputModality;
  durationSeconds: number;
  wordCount: number;
  createdAt: string;
  feedback?: TurnFeedbackData;
}

export interface InterviewQuestionData {
  id: string;
  sessionId: string;
  questionIndex: number;
  questionText: string;
  competency: string;
  contextReference?: string | null;
  isProbe: boolean;
  parentQuestionId?: string | null;
  responses?: InterviewResponseData[];
}

export interface CVRecommendation {
  cvItemId?: string;
  bulletPointId?: string;
  originalText?: string;
  recommendation: string;
  reason: string;
}

export interface QuestionSummaryItem {
  questionIndex: number;
  questionText: string;
  competency: string;
  studentResponse: string;
  score: number;
  modelAnswer: string;
}

export interface InterviewScorecardData {
  id: string;
  sessionId: string;
  overallScore: number;
  readinessTier: string;
  starScore: number;
  technicalScore: number;
  communicationScore: number;
  impactScore: number;
  keyStrengths: string[];
  keyGrowthAreas: string[];
  cvRecommendations: CVRecommendation[];
  questionsSummary?: QuestionSummaryItem[];
  createdAt: string;
}

export interface InterviewSessionData {
  id: string;
  userId: string;
  cvId?: string | null;
  targetRoleId?: string | null;
  targetRoleTitle: string;
  jobDescription?: string | null;
  track: InterviewTrack;
  sessionLength: SessionLength;
  mode: PracticeMode;
  status: SessionStatus;
  currentQuestionIndex: number;
  totalQuestions?: number;
  overallScore?: number | null;
  startedAt: string;
  completedAt?: string | null;
  firstQuestion?: InterviewQuestionData;
  questions?: InterviewQuestionData[];
  scorecard?: InterviewScorecardData | null;
}

export interface CreateInterviewSessionPayload {
  cvId?: string | null;
  targetRoleId?: string | null;
  targetRoleTitle: string;
  jobDescription?: string | null;
  track: InterviewTrack;
  sessionLength: SessionLength;
  mode: PracticeMode;
}

export interface SubmitAnswerPayload {
  questionId: string;
  responseText: string;
  inputModality: InputModality;
  durationSeconds: number;
}

export type SubmitAnswerResponse =
  | {
      type: 'PROBE';
      questionId: string;
      probeQuestion: InterviewQuestionData;
    }
  | {
      type: 'TURN_EVALUATION';
      questionId: string;
      feedback: TurnFeedbackData;
      sessionProgress: {
        currentQuestionIndex: number;
        totalQuestions: number;
        isComplete: boolean;
      };
      nextQuestion?: InterviewQuestionData;
    }
  | {
      type: 'SESSION_COMPLETED';
      questionId: string;
      sessionProgress: {
        currentQuestionIndex: number;
        totalQuestions: number;
        isComplete: boolean;
      };
      scorecardUrl: string;
    };
