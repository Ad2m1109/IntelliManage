import { Task } from './task.model'; // Keep Task if needed elsewhere, otherwise remove

// Backend ChatLog Request DTO (Frontend representation)
export interface ChatLogRequest {
    userId: number;
    projectId: number;
    content: string;
    date?: string; // Optional, backend can generate
}

// Frontend Chat Message Interface (for display and saving)
export interface ChatMessage {
    text: string;
    sender: 'user' | 'ai';
    id?: number; // Optional: ID from backend if saved
    saved?: boolean; // To indicate if the message has been saved
}

// Gemini API Request/Response Models (unchanged)
export interface GeminiPart {
    text: string;
}

export interface GeminiContent {
    parts: GeminiPart[];
}

export interface GeminiRequest {
    contents: GeminiContent[];
}

export interface GeminiCandidate {
    content: GeminiContent;
    finishReason: string;
    index: number;
    safetyRatings: any[];
}

export interface GeminiResponse {
    candidates: GeminiCandidate[];
    promptFeedback: any;
}
