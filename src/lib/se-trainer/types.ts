export interface SESection {
  id: number;
  title: string;
  icon: string;
  content: string;
}

export interface MCQuestion {
  id: number;
  section: number;
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface PracticeQuestion {
  id: number;
  section: number;
  category: "discovery" | "objection-handling" | "technical-depth" | "demo-design" | "customer-success";
  difficulty: "junior" | "mid" | "senior";
  prompt: string;
  guidancePoints: string[];
}

export interface FeedbackResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  interviewerPerspective: string;
}
