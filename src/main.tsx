import { ToastProvider } from '@heroui/react';
import { forwardLogging } from '@platform/logging';
import { createAppMenu } from '@platform/menus/app-menu';
import AboutModal from '@screens/AboutModal/AboutModal';
import ErrorDetailModal from '@screens/ErrorDetailModal';
import SettingsModal from '@screens/SettingsModal/SettingsModal';
import Shell from '@screens/Shell/Shell';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

forwardLogging();
const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to mount react');
}

function initialTheme() {
  const savedTheme = localStorage.getItem('exifmate.theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  if (window.matchMedia('prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

document.documentElement.classList.add(initialTheme());

createRoot(root).render(
  <StrictMode>
    <ToastProvider />
    <Shell />
    <AboutModal />
    <SettingsModal />
    <ErrorDetailModal />
  </StrictMode>,
);

createAppMenu().catch((err) => {
  console.error('Failed to create app menu:', err);
});
