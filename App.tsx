
import React, { useState, useEffect } from 'react';
import { 
  AppUser, 
  UserRole, 
  GameRoom, 
  FateCharacter, 
  ChatMessage, 
  FateDiceResult, 
  DiceRoll 
} from './types';
import { CharacterSheet } from './components/CharacterSheet';
import { Chat } from './components/Chat';
import { Icons } from './constants';
import { getGMAssistance } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'fatenexus_state_v3';

const createDefaultCharacter = (ownerId: string, name: string): FateCharacter => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  concept: '',
  trouble: '',
  fatePoints: 3,
  aspects: [
    { id: 'a1', value: '' },
    { id: 'a2', value: '' },
    { id: 'a3', value: '' }
  ],
  tempAspects: [],
  skills: { 
    counts: { '+5': 1, '+4': 1, '+3': 1, '+2': 1, '+1': 1, '0': 1 }, 
    inputs: {} 
  },
  customSkills: { 
    counts: {}, 
    inputs: {} 
  },
  stunts: [
    { id: 's1', value: '' },
    { id: 's2', value: '' },
    { id: 's3', value: '' }
  ],
  extras: '',
  stress: [
    { id: 'phys', name: 'Физический', count: 2, values: [false, false], canDelete: false },
    { id: 'ment', name: 'Ментальный', count: 2, values: [false, false], canDelete: false }
  ],
  consequences: [
    { id: 'c1', label: 'Лёгкое', value: -2, text: '' },
    { id: 'c2', label: 'Среднее', value: -4, text: '' },
    { id: 'c3', label: 'Тяжёлое', value: -6, text: '' }
  ],
  ownerId
});

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const { user: u, room: r } = JSON.parse(saved);
      setUser(u);
      setRoom(r);
    }
  }, []);

  useEffect(() => {
    if (user || room) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user, room }));
    }
  }, [user, room]);

  const createRoom = (userName: string) => {
    const newUser: AppUser = { id: Date.now().toString(), name: userName, role: UserRole.GM };
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: GameRoom = {
      code,
      name: `Стол ${userName}`,
      gmId: newUser.id,
      players: [newUser.id],
      characters: [],
      messages: [{
        id: 'msg1',
        sender: 'Система',
        text: `Комната ${code} создана. Добро пожаловать в Fate VTT!`,
        timestamp: Date.now(),
        type: 'system'
      }]
    };
    setUser(newUser);
    setRoom(newRoom);
  };

  const joinRoom = (userName: string, code: string) => {
    const newUser: AppUser = { id: Date.now().toString(), name: userName, role: UserRole.PLAYER };
    setUser(newUser);
    setRoom({
      code,
      name: "Приватный стол",
      gmId: 'gm1',
      players: ['gm1', newUser.id],
      characters: [],
      messages: [{
        id: 'mjoin',
        sender: 'Система',
        text: `${userName} присоединился к игре.`,
        timestamp: Date.now(),
        type: 'system'
      }]
    });
  };

  const addCharacter = () => {
    if (!room || !user) return;
    const newChar = createDefaultCharacter(user.id, user.role === UserRole.GM ? "НИП" : user.name);
    setRoom({ ...room, characters: [...room.characters, newChar] });
    setActiveCharId(newChar.id);
  };

  const updateCharacter = (char: FateCharacter) => {
    if (!room) return;
    setRoom({ ...room, characters: room.characters.map(c => c.id === char.id ? char : c) });
  };

  const handleRollResult = (label: string, modifier: number, results: FateDiceResult[]) => {
    if (!room || !activeCharId) return;
    const char = room.characters.find(c => c.id === activeCharId);
    if (!char) return;

    const sum = results.reduce((a, b) => a + b, 0);
    const total = sum + modifier;

    const roll: DiceRoll = {
      id: Math.random().toString(),
      sender: char.name,
      timestamp: Date.now(),
      label,
      results: results as [FateDiceResult, FateDiceResult, FateDiceResult, FateDiceResult],
      modifier,
      total
    };

    const msg: ChatMessage = {
      id: roll.id,
      sender: char.name,
      text: `Бросок на ${label}`,
      timestamp: Date.now(),
      type: 'roll',
      roll
    };

    setRoom({ ...room, messages: [...room.messages, msg] });
  };

  const sendMessage = (text: string) => {
    if (!room || !user) return;
    const msg: ChatMessage = {
      id: Math.random().toString(),
      sender: user.name,
      text,
      timestamp: Date.now(),
      type: 'text'
    };
    setRoom({ ...room, messages: [...room.messages, msg] });
  };

  const askAI = async (prompt: string) => {
    if (!room || !user) return;
    const context = `Characters: ${room.characters.map(c => c.name).join(', ')}.`;
    const aiResponse = await getGMAssistance(prompt, context);
    const aiMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'Gemini GM',
      text: aiResponse,
      timestamp: Date.now(),
      type: 'ai'
    };
    setRoom(prev => prev ? ({ ...prev, messages: [...prev.messages, aiMsg] }) : null);
  };

  if (!user || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#15171b]">
        <div className="max-w-md w-full bg-[#24272d] border border-[#3a4a63] p-10 rounded-3xl shadow-2xl text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#4aa3ff] tracking-tighter">Fate VTT</h1>
            <p className="text-[#9aa4b2] font-medium uppercase text-[10px] tracking-[0.2em]">Интерактивный стол</p>
          </div>
          <div className="space-y-6 text-left">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-[#3a4a63] uppercase ml-1">Ваше имя</label>
              <input type="text" placeholder="Имя игрока" id="userName" className="w-full bg-[#15181d] border border-[#3a4a63] rounded-lg p-3 text-white" />
              <button onClick={() => createRoom((document.getElementById('userName') as HTMLInputElement).value || 'ГМ')} className="w-full btn-fate py-3 font-bold">Создать стол</button>
            </div>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#3a4a63]"></span></div><div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#24272d] px-2 text-[#3a4a63]">ИЛИ</span></div></div>
            <div className="space-y-4">
              <input type="text" placeholder="Код приглашения" id="joinCode" className="w-full bg-[#15181d] border border-[#3a4a63] rounded-lg p-3 text-white text-center font-mono tracking-widest uppercase" />
              <button onClick={() => {
                const name = (document.getElementById('userName') as HTMLInputElement).value || 'Игрок';
                const code = (document.getElementById('joinCode') as HTMLInputElement).value;
                if (code) joinRoom(name, code);
              }} className="w-full py-3 font-bold rounded-lg border border-[#3a4a63] text-[#4aa3ff] hover:bg-[#3a4a63]/20 transition-all">Присоединиться</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#15171b]">
      <header className="h-16 bg-[#1b1d21] border-b border-[#3a4a63] flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4aa3ff] to-[#2f6fa3] rounded-lg flex items-center justify-center font-bold text-white text-xl">F</div>
          <div>
            <h1 className="font-bold text-[#e6e9ef] leading-tight">{room.name}</h1>
            <span className="text-[10px] bg-[#15181d] px-2 py-0.5 rounded text-[#9aa4b2] font-bold uppercase">Код: {room.code}</span>
          </div>
        </div>
        <button onClick={() => { if(confirm('Выйти?')){localStorage.removeItem(LOCAL_STORAGE_KEY); window.location.reload();}}} className="p-2 hover:bg-red-900/20 text-[#3a4a63] hover:text-red-500 rounded-lg"><Icons.Trash /></button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-[#1b1d21] border-r border-[#3a4a63] flex flex-col shrink-0">
          <div className="p-4 flex justify-between items-center border-b border-[#3a4a63]">
            <h2 className="text-[10px] font-bold text-[#3a4a63] uppercase tracking-widest">Персонажи</h2>
            <button onClick={addCharacter} className="p-1 text-[#4aa3ff] hover:bg-[#4aa3ff]/10 rounded transition"><Icons.Plus /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {room.characters.map(char => (
              <div key={char.id} onClick={() => setActiveCharId(char.id)} className={`flex items-center p-3 rounded-xl transition cursor-pointer ${activeCharId === char.id ? 'bg-[#24272d] text-[#e6e9ef] border border-[#3a4a63]' : 'text-[#9aa4b2] hover:bg-[#24272d]/40'}`}>
                <div className={`w-2 h-2 rounded-full mr-3 ${char.ownerId === user.id ? 'bg-[#4aa3ff]' : 'bg-[#3a4a63]'}`}></div>
                <div className="text-sm font-bold truncate">{char.name || 'Без имени'}</div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 bg-[#15171b]">
          {activeCharId ? (
            <div className="max-w-6xl mx-auto">
              <CharacterSheet 
                character={room.characters.find(c => c.id === activeCharId)!} 
                onUpdate={updateCharacter} 
                onRoll={handleRollResult} 
                isGM={user.role === UserRole.GM} 
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#3a4a63] opacity-20"><Icons.User /><h3 className="text-xl font-bold mt-4 uppercase tracking-widest">Выберите персонажа</h3></div>
          )}
        </main>

        <div className={`transition-all duration-300 shrink-0 ${isSidebarOpen ? 'w-80 lg:w-96' : 'w-0'}`}>
          <Chat messages={room.messages} currentUser={user} onSendMessage={sendMessage} onAskAI={askAI} />
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-[#1b1d21] border border-[#3a4a63] p-1 rounded-l-md text-[#3a4a63] hover:text-[#4aa3ff] ${isSidebarOpen ? 'mr-80 lg:mr-96' : 'mr-0'}`}>
          {isSidebarOpen ? '▶' : '◀'}
        </button>
      </div>
    </div>
  );
};

export default App;
