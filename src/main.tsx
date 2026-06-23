import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

window.addEventListener('error', (e) => {
  console.error('Erreur non capturée :', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Promesse rejetée :', e.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
