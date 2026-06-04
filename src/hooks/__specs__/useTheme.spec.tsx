/** biome-ignore-all lint/style/noNonNullAssertion: tests only got one good path */
import useTheme from '@hooks/useTheme';
import { loadSettings } from '@platform/settings';
import { getCurrentWindow, type Window } from '@tauri-apps/api/window';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

vi.mock('@platform/settings');
vi.mock('@tauri-apps/api/window');

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe('useTheme', () => {
  let win: Partial<Window>;

  beforeEach(() => {
    document.documentElement.classList.remove('light', 'dark');
    localStorage.clear();

    win = {
      theme: vi.fn<Window['theme']>().mockResolvedValue('light'),
      setTheme: vi.fn(() => Promise.resolve()),
      onThemeChanged: vi
        .fn<Window['onThemeChanged']>()
        .mockResolvedValue(() => {}),
    };

    vi.mocked(getCurrentWindow).mockReturnValue(win as Window);
  });

  it('can apply the `dark` class', async () => {
    vi.mocked(loadSettings).mockResolvedValue({ theme: 'dark' });
    renderHook(() => useTheme(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(win.setTheme).toHaveBeenCalledWith('dark');
    });

    expect(document.documentElement).toHaveClass('dark', { exact: true });
    expect(localStorage.getItem('exifmate.theme')).toBe('dark');
  });

  it('can apply the `light` class', async () => {
    vi.mocked(loadSettings).mockResolvedValue({ theme: 'light' });
    renderHook(() => useTheme(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(win.setTheme).toHaveBeenCalledWith('light');
    });

    expect(document.documentElement).toHaveClass('light', { exact: true });
    expect(localStorage.getItem('exifmate.theme')).toBe('light');
  });

  describe('when the them is `system`', () => {
    beforeEach(() => {
      vi.mocked(win.theme)!.mockResolvedValue('dark');
    });

    it('follows the OS theme', async () => {
      renderHook(() => useTheme(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark', { exact: true });
      });
      expect(win.setTheme).toHaveBeenCalledWith(null);
    });

    it('reacts to OS theme changes while in system mode', async () => {
      let osCallback: Parameters<Window['onThemeChanged']>[0];
      vi.mocked(win.onThemeChanged)!.mockImplementation(async (cb) => {
        osCallback = cb;
        return () => {};
      });

      renderHook(() => useTheme(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark', { exact: true });
      });

      act(() => {
        osCallback({ payload: 'light', event: '', id: 0 });
      });

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('light', { exact: true });
      });
    });
  });
});
