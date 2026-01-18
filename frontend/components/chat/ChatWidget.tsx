'use client';

import { useState } from 'react';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';
import ChatInterface from './ChatInterface';
import { useAuth } from '@/hooks/useAuth';

/**
 * ChatWidget - Floating chatbot interface
 *
 * This component provides a floating chat button and panel for the AI chatbot.
 * It manages the open/close state and renders the chat interface when opened.
 * Requires user authentication to function.
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  // Only show chat widget if user is authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <ChatButton isOpen={isOpen} onClick={toggleChat} />
      <ChatPanel isOpen={isOpen} onClose={closeChat}>
        <ChatInterface userId={user.id} onClose={closeChat} />
      </ChatPanel>
    </>
  );
}
