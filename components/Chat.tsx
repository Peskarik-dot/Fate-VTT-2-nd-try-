
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DiceRoll, AppUser } from '../types';
import { FateDiceIcon } from './FateDiceIcon';
import { SKILL_LADDER } from '../constants';

interface Props {
  messages: ChatMessage[];
  currentUser: AppUser;
  onSendMessage: (text: string) => void;
  onAskAI: (text: string) => void;
}

export const Chat: React.FC<Props> = ({ messages, currentUser, onSendMessage, onAskAI }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (input.startsWith('/ai ')) {
      onAskAI(input.replace('/ai ', ''));
    } else {
      onSendMessage(input);
    }
    setInput('');
  };

  const renderRoll = (roll: DiceRoll) => (
    <div className="mt-2 bg-[#1b1d21]/80 border border-[#3a4a63] rounded-lg p-3 shadow-inner">
      <div className="text-[10px] font-bold text-[#9aa4b2] uppercase mb-2">Бросок: {roll.label}</div>
      <div className="flex gap-1 mb-3">
        {roll.results.map((res, i) => <FateDiceIcon key={i} result={res} size="sm" />)}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#9aa4b2]">Навык: +{roll.modifier}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[#9aa4b2]">Итог:</span>
          <span className={`text-lg font-bold ${roll.total >= 4 ? 'text-green-400' : roll.total <= 0 ? 'text-red-400' : 'text-[#4aa3ff]'}`}>
            {roll.total}
          </span>
          <span className="text-[10px] text-[#9aa4b2] italic">({SKILL_LADDER[roll.total] || 'Вне лестницы'})</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#1b1d21] border-l border-[#3a4a63] w-80 lg:w-96 shadow-2xl relative">
      <div className="p-4 border-b border-[#3a4a63] bg-[#24272d]/80 backdrop-blur sticky top-0 z-10">
        <h2 className="text-lg font-bold fate-font text-[#e6e9ef]">Лента стола</h2>
        <div className="text-[10px] text-[#9aa4b2] uppercase tracking-widest mt-1">Прямой эфир</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === currentUser.name ? 'items-end' : 'items-start'}`}>
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${msg.type === 'ai' ? 'text-purple-400' : 'text-[#9aa4b2]'}`}>
                {msg.sender}
              </span>
              <span className="text-[9px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-md
              ${msg.type === 'system' ? 'bg-[#15181d] text-[#9aa4b2] italic border border-[#3a4a63]' : 
                msg.type === 'ai' ? 'bg-purple-900/30 text-purple-100 border border-purple-800/50' :
                msg.sender === currentUser.name ? 'bg-gradient-to-br from-[#4aa3ff] to-[#2f6fa3] text-white rounded-tr-none' : 'bg-[#24272d] text-[#e6e9ef] rounded-tl-none border border-[#3a4a63]'}
            `}>
              {msg.type === 'roll' && msg.roll ? renderRoll(msg.roll) : msg.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-[#3a4a63]">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            className="w-full bg-[#15181d] border border-[#3a4a63] rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4aa3ff] transition shadow-inner placeholder:text-[#3a4a63]"
            placeholder="Сообщение или /ai..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bg-gradient-to-br from-[#4aa3ff] to-[#2f6fa3] p-1.5 rounded-full text-white hover:brightness-110 transition shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-[#3a4a63] mt-2 text-center">Совет: Используйте <b>/ai</b> для помощи от Оракула Gemini</p>
      </div>
    </div>
  );
};
