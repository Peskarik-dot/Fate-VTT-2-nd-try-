
import React, { useState } from 'react';
import { FateCharacter, FateDiceResult } from '../types';
import { Icons } from '../constants';

interface Props {
  character: FateCharacter;
  onUpdate: (char: FateCharacter) => void;
  onRoll: (label: string, modifier: number, results: FateDiceResult[]) => void;
  isGM: boolean;
}

export const CharacterSheet: React.FC<Props> = ({ character, onUpdate, onRoll, isGM }) => {
  const [activeTab, setActiveTab] = useState<'ladder' | 'custom'>('ladder');
  const [rollModifier, setRollModifier] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [diceResults, setDiceResults] = useState<FateDiceResult[]>([0, 0, 0, 0]);
  const [showStressModal, setShowStressModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showConsModal, setShowConsModal] = useState(false);
  const [newStressName, setNewStressName] = useState('');
  const [modalSkillValue, setModalSkillValue] = useState(0);

  const updateChar = (updates: Partial<FateCharacter>) => onUpdate({ ...character, ...updates });

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400; 
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            updateChar({ image: dataUrl });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const rollFate = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const results = Array.from({ length: 4 }, () => (Math.floor(Math.random() * 3) - 1)) as FateDiceResult[];
      setDiceResults(results);
      setIsSpinning(false);
      onRoll("Ручной бросок", rollModifier, results);
    }, 1200);
  };

  const renderPyramid = (section: 'skills' | 'customSkills') => {
    const data = character[section];
    const sortedRatings = Object.keys(data.counts).sort((a, b) => parseInt(b) - parseInt(a));
    
    if (section === 'customSkills' && sortedRatings.length === 0) {
      return <p className="text-[#3a4a63] italic text-center text-sm py-4">Добавьте кастомные навыки через кнопку ниже</p>;
    }

    return (
      <div className="space-y-4">
        {sortedRatings.map(rating => {
          const count = data.counts[rating];
          return (
            <div key={rating} className="skill-row group">
              <span className="skill-rating">{rating}</span>
              <div className="flex-1 flex flex-wrap gap-2">
                {Array.from({ length: count }).map((_, i) => {
                  const key = `${rating}_${i}`;
                  return (
                    <input
                      key={key}
                      className="skill-input"
                      value={data.inputs[key] || ''}
                      placeholder="Навык / Подход"
                      onChange={(e) => {
                        const newInputs = { ...data.inputs, [key]: e.target.value };
                        updateChar({ [section]: { ...data, inputs: newInputs } });
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="w-7 h-7 bg-[#dc3545] text-white rounded flex items-center justify-center font-bold hover:brightness-110"
                  onClick={() => {
                    const newCounts = { ...data.counts };
                    if (newCounts[rating] > 1) newCounts[rating]--;
                    else delete newCounts[rating];
                    updateChar({ [section]: { ...data, counts: newCounts } });
                  }}
                >−</button>
                <button 
                  className="w-7 h-7 bg-[#28a745] text-white rounded flex items-center justify-center font-bold hover:brightness-110"
                  onClick={() => {
                    const newCounts = { ...data.counts, [rating]: data.counts[rating] + 1 };
                    updateChar({ [section]: { ...data, counts: newCounts } });
                  }}
                >+</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#24272d] border border-[#3a4a63] rounded-2xl p-6 lg:p-10 shadow-2xl space-y-8 animate-in fade-in duration-500">
      <header className="character-header">
        <div className="portrait shadow-xl relative group">
          <img src={character.image || 'https://via.placeholder.com/200x250?text=Портрет'} alt="Портрет" className="rounded-xl border border-[#3a4a63] bg-black object-cover w-[220px] h-[280px]" />
          <label className="portrait-upload-btn absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            📁 Обновить
            <input type="file" accept="image/*" hidden onChange={handlePortraitUpload} />
          </label>
        </div>

        <div className="basic-info flex-1">
          <div className="info-fields space-y-3">
            <input className="text-2xl font-bold text-[#4aa3ff]" placeholder="Имя персонажа" value={character.name} onChange={e => updateChar({ name: e.target.value })} />
            <input placeholder="Концепция" value={character.concept} onChange={e => updateChar({ concept: e.target.value })} />
            <input placeholder="Проблема" value={character.trouble} onChange={e => updateChar({ trouble: e.target.value })} />
          </div>

          <div className="fate-points mt-6 p-4 bg-[#1a1d23] rounded-xl border border-[#3a4a63] w-fit">
            <label className="text-[10px] font-bold text-[#3a4a63] uppercase tracking-widest block mb-2 text-center">Fate Points</label>
            <div className="fate-points-counter flex items-center gap-4">
              <button className="w-8 h-8 rounded-full bg-[#3a4a63] flex items-center justify-center hover:bg-[#4aa3ff] transition" onClick={() => updateChar({ fatePoints: Math.max(0, character.fatePoints - 1) })}>−</button>
              <span className={`text-3xl font-black min-w-[40px] text-center ${character.fatePoints === 0 ? 'text-red-500' : 'text-[#4aa3ff]'}`}>{character.fatePoints}</span>
              <button className="w-8 h-8 rounded-full bg-[#3a4a63] flex items-center justify-center hover:bg-[#4aa3ff] transition" onClick={() => updateChar({ fatePoints: character.fatePoints + 1 })}>+</button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
            <h2 className="text-[#4aa3ff] font-bold text-xl mb-4">Аспекты</h2>
            <div className="space-y-4">
              <div className="bg-[#1a1d23] p-4 rounded-xl border border-[#3a4a63]">
                <h3 className="text-[#4aa3ff] text-[10px] font-bold uppercase mb-4 opacity-50">Постоянные</h3>
                <div className="space-y-2">
                  {character.aspects.map((aspect, idx) => (
                    <div key={aspect.id} className="flex gap-2">
                      <input className="flex-1 text-sm bg-[#15181d] border border-[#3a4a63] rounded p-2 text-white" value={aspect.value} placeholder="Аспект..." onChange={e => {
                        const newA = [...character.aspects];
                        newA[idx].value = e.target.value;
                        updateChar({ aspects: newA });
                      }} />
                      <button className="text-red-500 px-2 hover:bg-red-500/10 rounded" onClick={() => updateChar({ aspects: character.aspects.filter(a => a.id !== aspect.id) })}>✖</button>
                    </div>
                  ))}
                  <button className="w-full py-2 bg-[#3a4a63]/20 text-[#4aa3ff] rounded-lg text-[10px] font-bold border border-dashed border-[#3a4a63] mt-2" onClick={() => updateChar({ aspects: [...character.aspects, { id: Math.random().toString(), value: '' }] })}>+ Добавить</button>
                </div>
              </div>

              <div className="bg-[#1a1d23] p-4 rounded-xl border border-[#3a4a63]">
                <h3 className="text-[#4aa3ff] text-[10px] font-bold uppercase mb-4 opacity-50">Временные / Призывы</h3>
                <div className="space-y-2">
                  {character.tempAspects.map((aspect, idx) => (
                    <div key={aspect.id} className="flex gap-2 items-center">
                      <input className="flex-1 text-sm bg-[#15181d] border border-[#3a4a63] rounded p-2 text-white" value={aspect.name} placeholder="Ситуация" onChange={e => {
                        const newT = [...character.tempAspects];
                        newT[idx].name = e.target.value;
                        updateChar({ tempAspects: newT });
                      }} />
                      <div className="flex items-center bg-[#15181d] border border-[#3a4a63] rounded p-1">
                        <button className="w-6 h-6 text-xs" onClick={() => {
                          const newT = [...character.tempAspects];
                          newT[idx].invokes = Math.max(0, newT[idx].invokes - 1);
                          updateChar({ tempAspects: newT });
                        }}>−</button>
                        <span className="w-6 text-center text-xs font-bold text-[#4aa3ff]">{aspect.invokes}</span>
                        <button className="w-6 h-6 text-xs" onClick={() => {
                          const newT = [...character.tempAspects];
                          newT[idx].invokes++;
                          updateChar({ tempAspects: newT });
                        }}>+</button>
                      </div>
                      <button className="text-red-500 px-2 hover:bg-red-500/10 rounded" onClick={() => updateChar({ tempAspects: character.tempAspects.filter(a => a.id !== aspect.id) })}>✖</button>
                    </div>
                  ))}
                  <button className="w-full py-2 bg-[#3a4a63]/20 text-[#4aa3ff] rounded-lg text-[10px] font-bold border border-dashed border-[#3a4a63] mt-2" onClick={() => updateChar({ tempAspects: [...character.tempAspects, { id: Math.random().toString(), name: '', invokes: 1 }] })}>+ Добавить</button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
            <h2 className="text-[#4aa3ff] font-bold text-xl mb-4">Навыки и Подходы</h2>
            <div className="flex gap-2 mb-6">
              <button className={`flex-1 py-2 text-xs font-bold rounded-lg border ${activeTab === 'ladder' ? 'bg-[#4aa3ff] text-white border-[#4aa3ff]' : 'text-[#3a4a63] border-[#3a4a63]'}`} onClick={() => setActiveTab('ladder')}>Лестница</button>
              <button className={`flex-1 py-2 text-xs font-bold rounded-lg border ${activeTab === 'custom' ? 'bg-[#4aa3ff] text-white border-[#4aa3ff]' : 'text-[#3a4a63] border-[#3a4a63]'}`} onClick={() => setActiveTab('custom')}>Кастом</button>
            </div>
            {activeTab === 'ladder' ? renderPyramid('skills') : renderPyramid('customSkills')}
            <div className="mt-6 flex justify-center gap-2">
               <button className="bg-[#17a2b8] text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider" onClick={() => setShowSkillModal(true)}>+ Новая строка</button>
               {activeTab === 'custom' && <button className="bg-red-900/20 text-red-500 px-4 py-2 rounded-lg font-bold text-[10px] uppercase" onClick={() => confirm("Очистить кастом?") && updateChar({ customSkills: { counts: {}, inputs: {} } })}>Очистить</button>}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-[#1f2228] p-5 rounded-xl border border-[#3a4a63]">
            <h2 className="text-[#4aa3ff] font-bold text-xl mb-4">Стресс и последствия</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {character.stress.map((track, idx) => (
                  <div key={track.id} className="bg-[#1a1d23] p-4 rounded-xl border border-[#3a4a63]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase text-[#9aa4b2]">{track.name}</span>
                      <button className="text-[10px] text-[#3a4a63] hover:text-[#4aa3ff]" onClick={() => {
                        const newS = [...character.stress];
                        newS[idx].values = newS[idx].values.map(() => false);
                        updateChar({ stress: newS });
                      }}>Сброс</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {track.values.map((checked, ci) => (
                        <div key={ci} onClick={() => {
                          const newS = [...character.stress];
                          const vals = [...newS[idx].values];
                          vals[ci] = !vals[ci];
                          newS[idx].values = vals;
                          updateChar({ stress: newS });
                        }} className={`w-8 h-8 rounded border-2 flex items-center justify-center cursor-pointer font-bold text-xs transition ${checked ? 'bg-[#4aa3ff] border-[#4aa3ff] text-white' : 'border-[#3a4a63] text-[#3a4a63] hover:border-[#4aa3ff]'}`}>
                          {ci + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 bg-[#3a4a63]/20 text-[#4aa3ff] rounded-lg text-[10px] font-bold border border-dashed border-[#3a4a63]" onClick={() => setShowStressModal(true)}>+ Новая шкала стресса</button>
              
              <div className="space-y-2 mt-4">
                {character.consequences.map((cons, idx) => (
                  <div key={cons.id} className="flex items-center bg-[#1a1d23] rounded-xl overflow-hidden border border-[#3a4a63]">
                    <div className="bg-[#4aa3ff] text-white text-[10px] font-bold px-3 py-4 min-w-[70px] text-center uppercase tracking-tighter">{cons.label}</div>
                    <div className="bg-red-600 text-white font-black px-2 py-4">{cons.value}</div>
                    <input className="flex-1 bg-transparent px-3 py-2 text-sm italic outline-none" placeholder="Опишите последствие..." value={cons.text} onChange={e => {
                      const newC = [...character.consequences];
                      newC[idx].text = e.target.value;
                      updateChar({ consequences: newC });
                    }} />
                    <button className="px-3 text-[#3a4a63] hover:text-red-500" onClick={() => updateChar({ consequences: character.consequences.filter(c => c.id !== cons.id) })}>✖</button>
                  </div>
                ))}
                <button className="w-full py-2 bg-[#3a4a63]/20 text-[#4aa3ff] rounded-lg text-[10px] font-bold border border-dashed border-[#3a4a63]" onClick={() => setShowConsModal(true)}>+ Добавить последствие</button>
              </div>
            </div>
          </section>

          <section className="bg-[#1f2228] p-6 rounded-xl border border-[#3a4a63] shadow-lg">
            <h2 className="text-[#4aa3ff] font-bold text-xl mb-6">Бросок кубиков</h2>
            <div className="flex justify-center gap-4 mb-8">
              {diceResults.map((r, i) => (
                <div key={i} className={`fate-die ${isSpinning ? 'spinning' : ''} ${r === 1 ? 'plus' : r === -1 ? 'minus' : ''}`}>
                   <div className="face">{r === 1 ? '+' : r === -1 ? '−' : '0'}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="bg-[#15181d] px-6 py-2 rounded-xl border border-[#3a4a63] text-center">
                <span className="text-[9px] font-bold text-[#3a4a63] uppercase block mb-1">Бонус</span>
                <div className="flex items-center gap-4">
                   <button className="text-[#4aa3ff] text-xl font-bold" onClick={() => setRollModifier(m => m - 1)}>−</button>
                   <span className="text-2xl font-black text-white w-10">{rollModifier >= 0 ? '+' : ''}{rollModifier}</span>
                   <button className="text-[#4aa3ff] text-xl font-bold" onClick={() => setRollModifier(m => m + 1)}>+</button>
                </div>
              </div>
              <button disabled={isSpinning} onClick={rollFate} className="bg-gradient-to-br from-[#4aa3ff] to-[#2f6fa3] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50">🎲 БРОСОК</button>
            </div>
          </section>
        </div>
      </div>

      {/* MODALS */}
      {showStressModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-white font-bold mb-4">Новая шкала</h3>
            <input className="modal-input mb-4" placeholder="Название (напр. Магия)" value={newStressName} onChange={e => setNewStressName(e.target.value)} autoFocus />
            <div className="flex gap-2">
               <button className="flex-1 py-2 bg-[#3a4a63] rounded text-xs" onClick={() => setShowStressModal(false)}>Отмена</button>
               <button className="flex-1 py-2 bg-[#4aa3ff] text-white rounded font-bold text-xs" onClick={() => {
                 if(newStressName) {
                   updateChar({ stress: [...character.stress, { id: Math.random().toString(), name: newStressName, count: 2, values: [false, false], canDelete: true }] });
                   setShowStressModal(false); setNewStressName('');
                 }
               }}>Создать</button>
            </div>
          </div>
        </div>
      )}

      {showSkillModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-white font-bold mb-4 text-center">Выберите рейтинг</h3>
            <div className="flex items-center justify-center gap-6 my-8">
               <button className="w-10 h-10 rounded-full border border-[#3a4a63]" onClick={() => setModalSkillValue(v => Math.max(-2, v - 1))}>−</button>
               <span className="text-5xl font-black text-[#4aa3ff]">{modalSkillValue >= 0 ? '+' : ''}{modalSkillValue}</span>
               <button className="w-10 h-10 rounded-full border border-[#3a4a63]" onClick={() => setModalSkillValue(v => Math.min(6, v + 1))}>+</button>
            </div>
            <div className="flex gap-2">
               <button className="flex-1 py-2 bg-[#3a4a63] rounded text-xs" onClick={() => setShowSkillModal(false)}>Отмена</button>
               <button className="flex-1 py-2 bg-[#4aa3ff] text-white rounded font-bold text-xs" onClick={() => {
                 const r = (modalSkillValue >= 0 ? '+' : '') + modalSkillValue;
                 const section = activeTab === 'ladder' ? 'skills' : 'customSkills';
                 const newData = { ...character[section] };
                 newData.counts[r] = (newData.counts[r] || 0) + 1;
                 updateChar({ [section]: newData });
                 setShowSkillModal(false);
               }}>Подтвердить</button>
            </div>
          </div>
        </div>
      )}

      {showConsModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-white font-bold mb-6 text-center">Тип последствия</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Лёгкое', v: -2 },
                { l: 'Среднее', v: -4 },
                { l: 'Тяжёлое', v: -6 },
                { l: 'Экстрим', v: -8 }
              ].map(t => (
                <button key={t.l} className="p-4 bg-[#1a1d23] border border-[#3a4a63] rounded-xl hover:border-[#4aa3ff] transition group" onClick={() => {
                  updateChar({ consequences: [...character.consequences, { id: Math.random().toString(), label: t.l, value: t.v, text: '' }] });
                  setShowConsModal(false);
                }}>
                  <div className="text-[10px] font-bold text-[#3a4a63] group-hover:text-[#4aa3ff]">{t.l}</div>
                  <div className="text-2xl font-black text-red-500">{t.v}</div>
                </button>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-[#3a4a63] text-xs" onClick={() => setShowConsModal(false)}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};
