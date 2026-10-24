import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AdminApp from './AdminApp';
import './styles.css';
import './game-ui.css';
import './empire-theme.css';
import './dashboard-polish.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element was not found.');

createRoot(rootElement).render(
  <StrictMode>
    {window.location.pathname.startsWith('/admin') ? <AdminApp /> : <App />}
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
