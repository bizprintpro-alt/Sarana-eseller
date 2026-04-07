'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageCircle, User } from 'lucide-react';

interface Message {
  id: string;
  from: 'me' | 'other';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'TechHub MN', lastMessage: 'Тийм, бараа бэлэн байна', time: '2 мин', unread: 2 },
  { id: '2', name: 'Bold Fashion', lastMessage: 'Захиалга баталгаажлаа', time: '15 мин', unread: 0 },
  { id: '3', name: 'Beauty Plaza', lastMessage: 'Хямдралын мэдээлэл', time: '1 цаг', unread: 1 },
  { id: '4', name: 'BurgerMN', lastMessage: 'Хүргэлтийн хаяг?', time: '3 цаг', unread: 0 },
];

const DEMO_MESSAGES: Message[] = [
  { id: '1', from: 'other', text: 'Сайн байна уу! iPhone 15 Pro бэлэн байна уу?', time: '10:30' },
  { id: '2', from: 'me', text: 'Сайн байна уу! Тийм, бэлэн байна. Өнгө юу авах вэ?', time: '10:31' },
  { id: '3', from: 'other', text: 'Titanium Natural хар өнгө байна уу?', time: '10:32' },
  { id: '4', from: 'me', text: 'Тийм, бараа бэлэн байна. Захиалга хийх үү?', time: '10:33' },
];

export default function ChatPage() {
  const [conversations] = useState(DEMO_CONVERSATIONS);
  const [activeChat, setActiveChat] = useState<string | null>('1');
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[var(--esl-bg-page)]">
      {/* Conversations list */}
      <div className="w-80 border-r border-[var(--esl-border)] flex flex-col">
        <div className="p-3 border-b border-[var(--esl-border)]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--esl-text-disabled)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Чат хайх..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChat(c.id)}
              className={`w-full text-left px-3 py-3 flex items-center gap-3 border-b border-[var(--esl-border)] transition ${
                activeChat === c.id ? 'bg-[var(--esl-bg-hover)]' : 'hover:bg-[var(--esl-bg-hover)]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#E8242C]/10 flex items-center justify-center shrink-0">
                <User size={18} className="text-[#E8242C]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--esl-text)] truncate">{c.name}</p>
                  <span className="text-[10px] text-[var(--esl-text-disabled)] shrink-0">{c.time}</span>
                </div>
                <p className="text-xs text-[var(--esl-text-secondary)] truncate">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#E8242C] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="h-14 px-4 border-b border-[var(--esl-border)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8242C]/10 flex items-center justify-center">
                <User size={14} className="text-[#E8242C]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--esl-text)]">
                  {conversations.find((c) => c.id === activeChat)?.name}
                </p>
                <p className="text-[10px] text-green-500">Онлайн</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                    m.from === 'me'
                      ? 'bg-[#E8242C] text-white rounded-br-md'
                      : 'bg-[var(--esl-bg-section)] text-[var(--esl-text)] rounded-bl-md'
                  }`}>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-0.5 ${m.from === 'me' ? 'text-white/60' : 'text-[var(--esl-text-disabled)]'}`}>{m.time}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[var(--esl-border)]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Мессеж бичих..."
                  className="flex-1 px-4 py-2.5 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-xl text-sm text-[var(--esl-text)]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="px-4 py-2.5 bg-[#E8242C] text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageCircle size={48} className="mx-auto mb-3 text-[var(--esl-text-disabled)]" />
              <p className="text-sm text-[var(--esl-text-secondary)]">Чат сонгоно уу</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
