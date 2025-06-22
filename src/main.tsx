import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { createAppMenu } from './core/app-menu';
import { isMobile } from './core/util';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import theme from './theme';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to mount react');
}

createRoot(root).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <App />
    </MantineProvider>
  </StrictMode>,
);

if (!isMobile()) {
  createAppMenu();
}
