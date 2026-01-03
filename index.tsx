
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Явное указание расширения для Babel в браузере

console.log('Fate VTT: Запуск приложения...');

const startApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('Fate VTT: React смонтирован успешно');
      return true;
    }
  } catch (err) {
    console.error('Fate VTT: Критическая ошибка при рендере:', err);
  }
  return false;
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startApp();
} else {
  document.addEventListener('DOMContentLoaded', startApp);
}
