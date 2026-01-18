'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  userId: string;
  conversationId?: string;
  onClose?: () => void;
}

/**
 * ChatInterface - Main chat component with message list and input
 *
 * This component handles:
 * - Displaying conversation history
 * - Sending user messages to the backend
 * - Receiving and displaying AI responses
 * - Auto-scrolling to latest messages
 * - Loading states during API calls
 */
export default function ChatInterface({ userId, conversationId: initialConversationId, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversation history on mount
  useEffect(() => {
    if (conversationId) {
      fetchConversationHistory();
    }
  }, [conversationId]);

  const fetchConversationHistory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}/${userId}/conversations/${conversationId}`,
        {
          credentials: 'include', // Send cookies with request
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversation history');
      }

      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching conversation history:', err);
      setError('Failed to load conversation history');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message to UI immediately
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      console.log('Sending message to:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}/${userId}/chat`);
      console.log('User ID:', userId);
      console.log('Message:', userMessage);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}/${userId}/chat`,
        {
          method: 'POST',
          credentials: 'include', // Send cookies with request (Better Auth session)
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            conversation_id: conversationId,
          }),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Update conversation ID if this is a new conversation
        if (!conversationId && data.conversation_id) {
          setConversationId(data.conversation_id);
        }

        // Add assistant response to UI
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                Welcome to your AI Task Assistant!
              </p>
              <p className="text-sm text-gray-500">
                Try saying "Add buy groceries to my list" or "Show me my tasks"
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gray-100'
                }`}
              >
                <p className={`text-sm whitespace-pre-wrap break-words ${
                  message.role === 'user' ? 'text-white font-medium' : 'text-gray-600'
                }`}>
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border text-gray-500 border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            aria-label="Message input"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Send message"
            type="button"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
