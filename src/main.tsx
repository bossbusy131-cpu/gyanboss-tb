import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Register service worker in production for PWA offline capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(<App />);
