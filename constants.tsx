
import React from 'react';

export const SKILL_LADDER: Record<number, string> = {
  8: 'Легендарный',
  7: 'Эпический',
  6: 'Фантастический',
  5: 'Великолепный',
  4: 'Отличный',
  3: 'Хороший',
  2: 'Приличный',
  1: 'Средний',
  0: 'Посредственный',
  [-1]: 'Плохой',
  [-2]: 'Ужасный'
};

export const DEFAULT_SKILLS = [
  'Атлетика', 'Взлом', 'Контакты', 'Ремесло', 'Обман', 
  'Вождение', 'Эмпатия', 'Ближний бой', 'Расследование', 'Знания', 
  'Внимательность', 'Телосложение', 'Провокация', 'Раппорт', 'Ресурсы', 
  'Стрельба', 'Скрытность', 'Воля'
];

export const Icons = {
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  Dice: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5zm2 2a1 1 0 110 2 1 1 0 010-2zm0 4a1 1 0 110 2 1 1 0 010-2zm4-4a1 1 0 110 2 1 1 0 010-2zm0 4a1 1 0 110 2 1 1 0 010-2zm4-4a1 1 0 110 2 1 1 0 010-2zm0 4a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
};
