import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { showDiagnosticErrorBanner } from './utils/diagnosticOverlay.ts';

// On-screen diagnostic error listeners for uncaught errors and unhandled rejections
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const message = event.message || (event.error && event.error.message) || 'Unknown Script Error';
    const stack = event.error ? event.error.stack : `${event.filename}:${event.lineno}:${event.colno}`;
    showDiagnosticErrorBanner('Window Runtime Error', message, stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason || 'Unhandled Promise Rejection');
    const stack = reason instanceof Error ? reason.stack : undefined;
    showDiagnosticErrorBanner('Unhandled Promise Rejection', message, stack);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

