'use client';

import { X, Minimize2 } from 'lucide-react';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function ChatPanel({ isOpen, onClose, children }: ChatPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }
        /* Mobile: Almost full screen with top margin for visibility */
        h-[90vh] w-full
        /* Small tablets: Slightly smaller with margins */
        sm:h-[85vh] sm:w-full
        /* Medium tablets: Fixed height panel with rounded corners */
        md:h-[500px] md:w-[400px] md:bottom-4 md:right-4 md:rounded-lg
        /* Large screens: Comfortable size */
        lg:h-[550px] lg:w-[420px] lg:bottom-6 lg:right-6
        /* Extra large screens: Maximum comfortable size */
        xl:h-[600px] xl:w-[450px]
        `}
        role="dialog"
        aria-label="Chat interface"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-blue-600 px-4 py-3 text-white md:rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="hidden rounded-full p-1 transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white md:block"
              aria-label="Minimize chat"
              type="button"
            >
              <Minimize2 className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close chat"
              type="button"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content Area - Placeholder for ChatKit */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {children || (
            <div className="flex flex-1 items-center justify-center p-4 text-center text-gray-500">
              <div>
                <p className="text-lg font-medium">Chat interface coming soon</p>
                <p className="mt-2 text-sm">ChatKit integration will be added here</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Optional branding */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs text-gray-500">
          Powered by AI
        </div>
      </div>
    </>
  );
}
