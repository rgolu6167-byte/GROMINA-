export type FeatureView = 'home' | 'teacher' | 'business' | 'website' | 'codex';

export interface CompareModel {
  id: string;
  name: string;
  color: string;
  badge: string;
}

export interface CompareResult {
  prompt: string;
  responses: Record<string, string>;
  timestamp: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size?: string;
  type: 'file' | 'image';
  url?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  // For teacher view structured response
  teacherData?: {
    topic: string;
    overview: string;
    steps: { step: number; title: string; content: string }[];
    proTip: string;
    checkQuestion: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      userAnswer?: number;
    };
  };
  // For codex view
  codexData?: {
    summary: string;
    generatedFiles: string[];
    terminalCommand?: string;
  };
}

export interface BusinessConfig {
  name: string;
  category: string;
  description: string;
  createdAt?: string;
}

export interface SocialConnection {
  platform: 'whatsapp' | 'facebook' | 'instagram';
  name: string;
  status: 'connected' | 'not_connected';
  accountName?: string;
}

export interface CodexFile {
  name: string;
  path: string;
  language: string;
  content: string;
}
