import { reportError } from '@platform/error-reporter';
import { loadSettings } from '@platform/settings';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import useSWR from 'swr';

function applyThemeClass(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

function useTheme() {
  const { data } = useSWR('settings', loadSettings, {
    revalidateOnFocus: false,
  });
  const setting = data?.theme ?? 'system';

  useEffect(() => {
    const win = getCurrentWindow();
    let cancelled = false;
    let unlisten: UnlistenFn | undefined;

    localStorage.setItem('exifmate.theme', setting);

    if (setting !== 'system') {
      applyThemeClass(setting);
      win.setTheme(setting).catch((err) => {
        reportError('Failed to set window theme', err, true);
      });
      return;
    }

    win.setTheme(null).catch((err) => {
      reportError('Failed to set window theme', err, true);
    });

    win
      .theme()
      .then((osTheme) => {
        if (cancelled) return;
        applyThemeClass(osTheme === 'dark' ? 'dark' : 'light');
      })
      .catch((err) => {
        reportError('Failed to read OS theme', err, true);
      });

    win
      .onThemeChanged(({ payload }) => {
        if (cancelled) return;
        applyThemeClass(payload === 'dark' ? 'dark' : 'light');
      })
      .then((u) => {
        if (cancelled) {
          u();
        } else {
          unlisten = u;
        }
      })
      .catch((err) => {
        reportError('Failed to subscribe to OS theme changes', err, true);
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [setting]);
}

export default useTheme;
