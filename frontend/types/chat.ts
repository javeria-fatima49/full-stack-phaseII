/**
 * Chat-related TypeScript types for Phase 3 AI Chatbot
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  result: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  success: boolean;
  conversation_id: string;
  response: string;
  tool_calls: ToolCall[];
  error?: string;
}

export interface ConversationHistoryResponse {
  success: boolean;
  conversation_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  error?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
