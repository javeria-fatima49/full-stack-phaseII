'use client';

import { MessageCircle, X } from 'lucide-react';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function ChatButton({ isOpen, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95"
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      type="button"
    >
      {isOpen ? (
        <X className="h-6 w-6" aria-hidden="true" />
      ) : (
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      )}
    </button>
  );
}
