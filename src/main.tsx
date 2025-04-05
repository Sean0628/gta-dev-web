import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App.tsx';
import './index.css';

injectSpeedInsights();

// Console message for developers
const devToolsMessage = `
%cWelcome to GTA Tech Meetups! 🚀

%cHelp keep the GTM safe, report any suspicious activity to a member of staff.
If you see something, say something. 

Report it at: https://github.com/Sean0628/gta-dev-web/issues

Your contributions help make the Toronto tech community better!
`;

// Listen for devtools open
const devtools = {
  isOpen: false,
  orientation: undefined,
};

const threshold = 160;

const emitEvent = () => {
  if (!devtools.isOpen) {
    devtools.isOpen = true;
    console.log(
      devToolsMessage,
      'font-size: 20px; font-weight: bold; color: #3B82F6;',
      'font-size: 14px; color: #6B7280;'
    );
  }
};

const main = ({ emitEvents = true } = {}) => {
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (
    !(heightThreshold && widthThreshold) &&
    ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) ||
      widthThreshold ||
      heightThreshold)
  ) {
    if (emitEvents) emitEvent();
  } else {
    devtools.isOpen = false;
  }
};

if (typeof window !== 'undefined') {
  setInterval(main, 500);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);
