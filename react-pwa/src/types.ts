export type DomainId = "1" | "2" | "3" | "4" | "5";

export interface Question {
  id: string;
  domain: DomainId;
  objective: string;
  prompt: string;
  options: string[];
  answer: number;
  explanationFr: string;
  scenario?: boolean;
  sourceSection?: string;
  sourceTitle?: string;
  questionType?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export type PBQType = "matching" | "ordering" | "firewall" | "log" | "topology" | "iam";

export interface PBQ {
  id: string;
  type: PBQType;
  title: string;
  instructions: string;
  explanation: string;
}

export interface Flashcard {
  id: string;
  term: string;
  fullName: string;
  definitionFr: string;
  example: string;
  objective: string;
  domain: string;
  examTip?: string;
  trap?: string;
  memoryHook?: string;
  source?: string;
}

export interface PortProtocol {
  port: string;
  protocol: string;
  transport: string;
}

export type ExamAnswer = number | Record<string, string>;

export interface ExamState {
  examSet: string;
  started: number;
  questions: Array<Question | { id: string; examType: "pbq"; pbq: PBQ; domain: DomainId; objective: string; explanationFr: string }>;
  index: number;
  answers: Record<string, ExamAnswer>;
  submitted: boolean;
  paused?: boolean;
  pausedAt?: number | null;
  totalPausedMs?: number;
}

export interface Progress {
  answers: Record<string, unknown>;
  flagged: Record<string, boolean>;
  flashcards: Record<string, "again" | "know">;
  quizAttempts: unknown[];
  ports: { attempts: unknown[] };
  pbq: Record<string, number>;
  resources: unknown[];
  exams: ExamState[];
  practiceSessions?: unknown[];
  questionTiming?: unknown[];
}
