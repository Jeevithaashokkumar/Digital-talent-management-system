'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, fontSize } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark-theme');
    }

    // Apply font size
    const sizes = { sm: '12px', md: '14px', lg: '16px' };
    root.style.setProperty('--base-font-size', sizes[fontSize]);
  }, [theme, fontSize]);

  return <>{children}</>;
}
