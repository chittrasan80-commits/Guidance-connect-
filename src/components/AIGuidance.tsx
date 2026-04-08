import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User as UserIcon, Loader2, BrainCircuit, Target, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';

interface AIGuidanceProps {
  user: User;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function AIGuidance({ user }: AIGuidanceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hello ${user.name}! I'm your AI Guidance Assistant. I can help you explore career paths, suggest academic strategies, or provide general guidance. What's on your mind today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are a professional guidance counselor. The user is a ${user.role} named ${user.name}. Provide helpful, encouraging, and specific advice. User says: ${userMessage}` }] }
        ],
        config: {
          systemInstruction: "You are an expert guidance counselor. Keep responses concise, empathetic, and actionable. Use markdown for formatting if needed.",
        }
      });

      const aiResponse = response.text || "I'm sorry, I couldn't process that request. How else can I help?";
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { text: "Suggest career paths for me", icon: Target },
    { text: "How to manage study stress?", icon: BrainCircuit },
    { text: "Tips for college applications", icon: Lightbulb },
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-white flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white mr-4 shadow-lg shadow-brand-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">AI Guidance Assistant</h3>
            <p className="text-xs text-slate-500">Powered by Gemini AI</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-slate-200 ml-3' : 'bg-brand-100 mr-3'
              }`}>
                {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-brand-600" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%]">
              <div className="w-8 h-8 rounded-lg bg-brand-100 mr-3 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-600" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s) => (
              <button
                key={s.text}
                onClick={() => { setInput(s.text); }}
                className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-brand-500 hover:text-brand-600 transition-all"
              >
                <s.icon className="w-3 h-3 mr-2" />
                {s.text}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your career or studies..."
            className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-3">
          AI can make mistakes. Consider verifying important information with your human counselor.
        </p>
      </div>
    </div>
  );
}
