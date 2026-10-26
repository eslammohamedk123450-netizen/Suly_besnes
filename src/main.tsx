import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles.css';
import './game-ui.css';
import './empire-theme.css';
import './modern-sections.css';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
