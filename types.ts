
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  TEXT_TO_SIGN = 'TEXT_TO_SIGN',
  VOICE_TO_TEXT = 'VOICE_TO_TEXT',
  ALPHABET = 'ALPHABET',
  COMMUNICATION = 'COMMUNICATION',
  TRANSLATOR = 'TRANSLATOR',
  SIGN_KEYBOARD = 'SIGN_KEYBOARD',
  COMMUNITY = 'COMMUNITY',
  SIGN_TO_TEXT = 'SIGN_TO_TEXT'
}

export interface TranscriptionItem {
  id: string;
  text: string;
  type: 'user' | 'model';
  timestamp: Date;
}

export interface SignGlossResult {
  gloss: string;
  description: string;
  movements: string[];
}

export interface CommunityPost {
  id: string;
  author: string;
  category: 'News' | 'Update' | 'Testimonial';
  content: string;
  date: string;
  likes: number;
}

export interface User {
  id: string;
  name: string;
  role: 'patient' | 'provider';
  neuralId: string;
}
