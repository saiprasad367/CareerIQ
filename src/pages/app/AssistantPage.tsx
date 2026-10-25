import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Info, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { generateId } from '@/lib/storage';
import { api } from '@/services/api';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const SUGGESTED_PROMPTS = [
  'What is my best-matching career role?',
  'Which skills should I learn first?',
  'How do I improve my ATS score?',
  'What projects can I add to strengthen my resume?',
  'How should I prepare for a Backend Developer interview?',
  'What are the highest-paying roles I can target?',
];

export function AssistantPage() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const candidateName = storage.getUser()?.name?.split(' ')[0] || 'there';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: `Hi ${candidateName} 👋 I'm your CareerIQ AI Advisor powered by Google Gemini. I analyze your live profile, resume, and skill taxonomy in real-time. How can I help you accelerate your career goals today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages(m => [...m, userMsg]);
    setTyping(true);

    try {
      const res = await api.assistant.chat(messageText, sessionId);
      if (res && res.response) {
        if (!sessionId && res.session_id) {
          setSessionId(res.session_id);
        }
        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: res.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(m => [...m, assistantMsg]);
        setTyping(false);
        return;
      }
      throw new Error('Empty response from AI assistant');
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I encountered an issue connecting to the CareerIQ AI service: ${err?.message || 'Network error'}. Please check your backend connection and try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(m => [...m, errMsg]);
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-[#111111] mt-2">{line.slice(2, -2)}</p>;
      }
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7rem)] animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0EDFF] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#4c1d95]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#111111]">Career Assistant</h1>
            <p className="text-xs text-[#858585]">Real-time AI Guidance · Powered by Google Gemini & Live Profile</p>
          </div>
          <button
            onClick={() => setMessages([{ id: generateId(), role: 'assistant', content: `Hi again, ${candidateName}! How can I help with your career today?`, timestamp: new Date().toISOString() }])}
            className="ml-auto btn-ghost p-2"
            aria-label="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#E8F6EE] rounded-lg p-2.5 mt-3">
          <Sparkles className="w-4 h-4 text-[#1a6b3a] flex-shrink-0" />
          <p className="text-xs text-[#1a6b3a]">
            Connected to CareerIQ backend & Google Gemini AI. Instant personalized career guidance synced with your database profile and skills.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-area space-y-4 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
              msg.role === 'assistant' ? 'bg-[#F0EDFF]' : 'bg-[#EAF3FF]'
            )}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-[#4c1d95]" />
                : <User className="w-4 h-4 text-[#1a5fb4]" />
              }
            </div>
            <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm',
              msg.role === 'assistant'
                ? 'bg-white border border-[#EAEAEA] text-[#111111] rounded-tl-sm'
                : 'bg-[#111111] text-white rounded-tr-sm'
            )}>
              {msg.role === 'assistant' ? formatContent(msg.content) : <p>{msg.content}</p>}
              <p className={cn('text-[10px] mt-2', msg.role === 'assistant' ? 'text-[#858585]' : 'text-white/50')}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#F0EDFF] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-[#4c1d95]" />
            </div>
            <div className="bg-white border border-[#EAEAEA] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-[#858585] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — show when no user messages */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3">
          {SUGGESTED_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-left text-xs bg-[#F7F8FA] hover:bg-[#EAEAEA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 transition-colors text-[#666666] hover:text-[#111111] leading-snug"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 bg-white border border-[#EAEAEA] rounded-2xl flex items-end gap-2 p-3 shadow-sm">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your career, skills, or job search…"
          rows={1}
          className="flex-1 resize-none text-sm text-[#111111] placeholder-[#858585] outline-none bg-transparent max-h-32 scroll-area"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || typing}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            input.trim() && !typing
              ? 'bg-[#111111] text-white hover:bg-[#333333]'
              : 'bg-[#F7F8FA] text-[#858585] cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
