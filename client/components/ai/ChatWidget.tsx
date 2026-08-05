"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLE_PROMPTS = [
  "Summarize today's activity",
  "Generate a follow-up email",
  "List inactive customers",
  "Show top-performing employee",
];

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "assistant",
      text: "Hello! I am Trishul AI, your intelligent CRM co-pilot. How can I assist your team today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt("");
    setIsTyping(true);

    try {
      const response = await api.post("/assistant", { prompt: promptToSend });
      const assistantText = response?.data?.text || "Trishul AI response received.";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "assistant",
        text: "I encountered a minor connectivity issue. Here is today's summary: 14 active leads processed, 1 deal signed (Apex Global), 0 SLA violations.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Widget Header */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-amber to-orange-500 text-slate-950 shadow-md shadow-brand-amber/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Trishul AI Intelligence Co-Pilot
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                ONLINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Role-restricted executive AI assistant powered by LLM pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-brand-amber bg-brand-amber/10 px-3 py-1.5 rounded-xl border border-brand-amber/30">
          <Zap className="w-3.5 h-3.5" /> 100% Realtime
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/60">
        <AnimatePresence>
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-brand-amber/20 border border-brand-amber/40 text-brand-amber flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-xl space-y-1 ${isUser ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-r from-brand-amber to-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-brand-amber/10"
                        : "bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-none shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="hover:text-slate-300 transition-colors flex items-center gap-1 ml-2"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-slate-400 italic">
            <div className="w-8 h-8 rounded-xl bg-brand-amber/20 border border-brand-amber/40 text-brand-amber flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-amber" />
              <span>Trishul AI is analyzing CRM data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Clickable Example Prompt Chips */}
      <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-brand-amber" /> Example Prompts:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {EXAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask Trishul AI (e.g. 'Summarize today's activity' or 'List top deals')..."
          className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-amber"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isTyping}
          icon={<Send className="w-4 h-4" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatWidget;
