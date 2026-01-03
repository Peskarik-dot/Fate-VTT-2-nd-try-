
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// === TYPES ===
type FateDiceResult = -1 | 0 | 1;

interface DiceRoll {
  id: string;
  sender: string;
  timestamp: number;
  label: string;
  results: [FateDiceResult, FateDiceResult, FateDiceResult, FateDiceResult];
  modifier: number;
  total: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type: 'text' | 'roll' | 'system' | 'ai';
  roll?: DiceRoll;
}

interface FateCharacter {
  id: string;
  name: string;
  concept: string;
  trouble: string;
  image?: string;
  fatePoints: number;
  aspects: { id: string; value: string }[];
  tempAspects: { id: string; name: string; invokes: number }[];
  skills: { counts: Record<string, number>; inputs: Record<string, string> };
  customSkills: { counts: Record<string, number>; inputs: Record<string, string> };
  stress: { id: string; name: string; count: number; values: boolean[]; canDelete: boolean }[];
  consequences: { id: string; label: string; value: number; text: string }[];
  ownerId: string;
}

// === CONSTANTS & ICONS ===
const SKILL_LADDER: Record<number, string> = {
  8: 'Легендарный', 7: 'Эпический', 6: 'Фантастический', 5: 'Великолепный',
  4: 'Отличный', 3: 'Хороший', 2: 'Приличный', 1: 'Средний',
  0: 'Посредственный', [-1]: 'Плохой', [-2]: 'Ужасный'
};

const Icons = {
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  User: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
};

// === SERVICES ===
const getGMAssistance = async (prompt: string, context: string) => {
  // Always use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are an AI assistant for a FATE RPG Game Master. Context: ${context}. Respond in Russian.`,
      },
    });
    // Use .text property directly.
    return response.text || "Ошибка связи с Оракулом.";
  } catch (error) {
    return "Духи переплетений молчат.";
  }
};

// === COMPONENTS ===
// Fix for Error: Type '{ key: any; result: any; }' is not assignable to type '{ result: FateDiceResult; size?: "sm" | "md"; }'.
// Using React.FC to properly support 'key' prop.
const FateDiceIcon: React.FC<{ result: FateDiceResult, size?: 'sm' | 'md' }> = ({ result, size = 'md' }) => {
  const styles = result === 1 ? 'bg-emerald-600 border-emerald-400' : result === -1 ? 'bg-rose-700 border-rose-500' : 'bg-slate-700 border-slate-500';
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-10 h-10 text-xl';
  return (
    <div className={`${sizeClass} ${styles} border-2 rounded-lg flex items-center justify-center font-bold text-white shadow-inner`}>
      {result === 1 ? '+' : result === -1 ? '−' : '0'}
    </div>
  );
};

const CharacterSheet = ({ character, onUpdate, onRoll }: { character: FateCharacter, onUpdate: (c: any) => void, onRoll: any }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [diceResults, setDiceResults] = useState<FateDiceResult[]>([0, 0, 0, 0]);
  const [mod, setMod] = useState(0);

  const updateChar = (upd: any) => onUpdate({ ...character, ...upd });

  const handleRoll = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const res = Array.from({ length: 4 }, () => (Math.floor(Math.random() * 3) - 1)) as FateDiceResult[];
      setDiceResults(res);
      setIsSpinning(false);
      onRoll("Бросок", mod, res);
    }, 800);
  };

  return (
    <div className="bg-[#24272d] border border-[#3a4a63] rounded-2xl p-6 lg:p-10 shadow-2xl space-y-8 animate-in fade-in">
      <div className="flex flex-wrap gap-8 items-start">
        <div className="w-[220px] shrink-0 space-y-4">
          <div className="bg-black rounded-xl overflow-hidden border border-[#3a4a63] aspect-[3/4] flex items-center justify-center text-[#3a4a63]">
            {character.image ? <img src={character.image} className="w-full h-full object-cover" /> : <Icons.User />}
          </div>
          <div className="bg-[#1a1d23] p-4 rounded-xl border border-[#3a4a63] text-center">
            <span className="text-[10px] text-[#3a4a63] font-bold uppercase block mb-1">Fate Points</span>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => updateChar({ fatePoints: Math.max(0, character.fatePoints - 1) })} className="w-8 h-8 rounded-full bg-[#3a4a63]">-</button>
              <span className="text-2xl font-black text-[#4aa3ff]">{character.fatePoints}</span>
              <button onClick={() => updateChar({ fatePoints: character.fatePoints + 1 })} className="w-8 h-8 rounded-full bg-[#3a4a63]">+</button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 min-w-[300px]">
          <input className="w-full bg-transparent text-3xl font-black text-[#4aa3ff] outline-none" value={character.name} onChange={e => updateChar({ name: e.target.value })} placeholder="Имя героя..." />
          <div className="grid gap-2">
            <input className="w-full bg-[#1a1d23] border border-[#3a4a63] p-3 rounded-lg text-sm" value={character.concept} onChange={e => updateChar({ concept: e.target.value })} placeholder="Концепция" />
            <input className="w-full bg-[#1a1d23] border border-[#3a4a63] p-3 rounded-lg text-sm" value={character.trouble} onChange={e => updateChar({ trouble: e.target.value })} placeholder="Проблема" />
          </div>
          
          <div className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
             <h3 className="text-[#4aa3ff] font-bold text-sm uppercase mb-4">Бросок кубиков</h3>
             <div className="flex justify-center gap-3 mb-6">
                {diceResults.map((r, i) => <FateDiceIcon key={i} result={r} />)}
             </div>
             <div className="flex items-center justify-center gap-4">
                <div className="flex items-center bg-[#15181d] rounded-lg border border-[#3a4a63] px-3">
                   <button onClick={() => setMod(m => m - 1)} className="p-2 text-[#4aa3ff] font-bold">−</button>
                   <span className="w-8 text-center font-bold">{mod >= 0 ? '+' : ''}{mod}</span>
                   <button onClick={() => setMod(m => m + 1)} className="p-2 text-[#4aa3ff] font-bold">+</button>
                </div>
                <button onClick={handleRoll} disabled={isSpinning} className="bg-[#4aa3ff] text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition disabled:opacity-50">БРОСОК</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chat = ({ messages, currentUser, onSendMessage, onAskAI }: { messages: ChatMessage[], currentUser: any, onSendMessage: any, onAskAI: any }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (input.startsWith('/ai ')) onAskAI(input.slice(4));
    else onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#1b1d21] border-l border-[#3a4a63] w-80 lg:w-96">
      <div className="p-4 border-b border-[#3a4a63] font-bold text-[#e6e9ef]">Лента стола</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === currentUser.name ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] font-bold text-[#3a4a63] uppercase mb-1">{msg.sender}</span>
            <div className={`px-4 py-2 rounded-2xl text-sm ${msg.type === 'ai' ? 'bg-purple-900/30 text-purple-100 border border-purple-800/50' : msg.sender === currentUser.name ? 'bg-[#4aa3ff] text-white' : 'bg-[#24272d] border border-[#3a4a63]'}`}>
              {msg.type === 'roll' && msg.roll ? `Результат: ${msg.roll.total}` : msg.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="p-4 border-t border-[#3a4a63] relative">
        <input className="w-full bg-[#15181d] border border-[#3a4a63] rounded-full py-3 pl-4 pr-12 text-sm outline-none focus:border-[#4aa3ff]" placeholder="Сообщение или /ai..." value={input} onChange={e => setInput(e.target.value)} />
        <button type="submit" className="absolute right-6 top-6 text-[#4aa3ff]"><Icons.Send /></button>
      </form>
    </div>
  );
};

// === MAIN APP ===
const App = () => {
  const [user, setUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);

  const initRoom = (name: string) => {
    const newUser = { id: Date.now().toString(), name, role: 'GM' };
    const newRoom = {
      code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      name: `Стол ${name}`,
      characters: [{ id: '1', name: name, concept: '', trouble: '', fatePoints: 3, aspects: [], tempAspects: [], skills: { counts: {}, inputs: {} }, customSkills: { counts: {}, inputs: {} }, stress: [], consequences: [], ownerId: newUser.id }],
      messages: [{ id: 'm1', sender: 'Система', text: 'Стол готов!', timestamp: Date.now(), type: 'system' }]
    };
    setUser(newUser);
    setRoom(newRoom);
    setActiveCharId('1');
  };

  if (!user || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#15171b] p-6">
        <div className="bg-[#24272d] border border-[#3a4a63] p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6">
          <h1 className="text-4xl font-black text-[#4aa3ff]">Fate VTT</h1>
          <input id="uName" className="w-full bg-[#15181d] border border-[#3a4a63] p-4 rounded-xl text-white outline-none" placeholder="Ваше имя..." />
          <button onClick={() => initRoom((document.getElementById('uName') as HTMLInputElement).value || 'Герой')} className="w-full bg-[#4aa3ff] text-white py-4 rounded-xl font-bold hover:brightness-110 transition">Войти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#15171b] overflow-hidden">
      <header className="h-16 border-b border-[#3a4a63] flex items-center justify-between px-6 bg-[#1b1d21]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4aa3ff] rounded flex items-center justify-center font-bold text-white">F</div>
          <span className="font-bold">{room.name} (Код: {room.code})</span>
        </div>
        <button onClick={() => window.location.reload()} className="text-[#3a4a63] hover:text-red-500"><Icons.Trash /></button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r border-[#3a4a63] bg-[#1b1d21] p-4">
          <h2 className="text-[10px] font-bold text-[#3a4a63] uppercase tracking-widest mb-4">Герои</h2>
          {room.characters.map((c: any) => (
            <div key={c.id} className="p-3 bg-[#24272d] border border-[#3a4a63] rounded-xl font-bold text-sm text-[#4aa3ff] mb-2">{c.name}</div>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-10">
          {activeCharId && <CharacterSheet 
            character={room.characters.find((c: any) => c.id === activeCharId)} 
            onUpdate={(upd: any) => setRoom({ ...room, characters: room.characters.map((c: any) => c.id === upd.id ? upd : c) })}
            onRoll={(label: string, mod: number, res: any) => {
              const total = res.reduce((a: number, b: number) => a + b, 0) + mod;
              const msg: ChatMessage = { id: Date.now().toString(), sender: user.name, text: `Бросок: ${total}`, timestamp: Date.now(), type: 'roll', roll: { id: 'r', sender: user.name, timestamp: Date.now(), label, results: res, modifier: mod, total } };
              setRoom({ ...room, messages: [...room.messages, msg] });
            }}
          />}
        </main>

        <Chat 
          messages={room.messages} 
          currentUser={user} 
          onSendMessage={(text: string) => setRoom({ ...room, messages: [...room.messages, { id: Date.now().toString(), sender: user.name, text, timestamp: Date.now(), type: 'text' }] })}
          onAskAI={async (text: string) => {
             const res = await getGMAssistance(text, room.characters.map((c: any) => c.name).join(', '));
             setRoom((prev: any) => ({ ...prev, messages: [...prev.messages, { id: Date.now().toString(), sender: 'Gemini GM', text: res, timestamp: Date.now(), type: 'ai' }] }));
          }}
        />
      </div>
    </div>
  );
};

// Start initialization
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
