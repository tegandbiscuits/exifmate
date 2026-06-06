import { vi } from 'vitest';

vi.mock('@tauri-apps/plugin-os');

interface MockMenuItem {
  setEnabled: ReturnType<typeof vi.fn>;
  setText: ReturnType<typeof vi.fn>;
}

const makeItem = (): MockMenuItem => ({
  setEnabled: vi.fn(() => Promise.resolve()),
  setText: vi.fn(),
});

export const Submenu = {
  new: vi.fn(() => Promise.resolve(makeItem())),
};

export const PredefinedMenuItem = {
  new: vi.fn(),
};

export const MenuItem = {
  new: vi.fn(() => Promise.resolve(makeItem())),
};
