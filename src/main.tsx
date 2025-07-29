import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import mock WebSocket in development

createRoot(document.getElementById('root')!).render(
    <App />
);