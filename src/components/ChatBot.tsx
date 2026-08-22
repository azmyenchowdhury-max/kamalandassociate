
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to Kamal & Associates! I'm your AI Legal Assistant. How can I help you today? I can provide information about our practice areas, attorneys, or help you schedule a free consultation."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('law-chatbot', {
        body: { 
          message: userMessage,
          conversationHistory 
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize for the inconvenience. Please contact us directly at +880 2-9821234 or email kamalandassociates.info@gmail.com for assistance." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center shadow-lg hover:bg-[#f4d03f] transition-all duration-300 animate-pulse-gold ${isOpen ? 'hidden' : ''}`}
        aria-label="Open chat"
      >
        <MessageCircle size={28} className="text-black" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] transition-all duration-300 ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-[#111111] border border-[#d4af37]/40 shadow-2xl shadow-black/50 flex flex-col h-[500px] max-h-[calc(100vh-100px)]">
          {/* Header */}
          <div className="bg-[#0a0a0a] border-b border-[#d4af37]/30 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center">
                <Bot size={20} className="text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Legal Assistant</h3>
                <p className="text-xs text-[#d4af37]">Online • 24/7 Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-[#d4af37]' : 'bg-[#1a1a1a] border border-[#d4af37]/30'
                }`}>
                  {message.role === 'user' ? (
                    <User size={16} className="text-black" />
                  ) : (
                    <Bot size={16} className="text-[#d4af37]" />
                  )}
                </div>
                <div className={`max-w-[75%] px-4 py-3 text-sm ${
                  message.role === 'user' 
                    ? 'bg-[#d4af37] text-black rounded-2xl rounded-tr-sm' 
                    : 'bg-[#1a1a1a] text-gray-200 rounded-2xl rounded-tl-sm border border-[#d4af37]/20'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#1a1a1a] border border-[#d4af37]/30">
                  <Bot size={16} className="text-[#d4af37]" />
                </div>
                <div className="bg-[#1a1a1a] text-gray-200 rounded-2xl rounded-tl-sm border border-[#d4af37]/20 px-4 py-3">
                  <Loader2 size={18} className="animate-spin text-[#d4af37]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#d4af37]/30 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-[#1a1a1a] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center hover:bg-[#f4d03f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="text-black" />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 text-center">
              This is general information only. For specific legal advice, please consult our attorneys.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
