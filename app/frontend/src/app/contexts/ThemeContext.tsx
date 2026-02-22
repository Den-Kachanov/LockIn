import { createContext, useContext, useState, ReactNode } from 'react';

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
}

export const themes: Record<string, Theme> = {
  cyber: {
    name: 'Cyber',
    primary: '#00d9ff',
    secondary: '#ff00ff',
    accent: '#ffd700',
    gradientFrom: '#0a0e27',
    gradientTo: '#2d1b4e',
  },
  matrix: {
    name: 'Matrix',
    primary: '#00ff00',
    secondary: '#00aa00',
    accent: '#88ff88',
    gradientFrom: '#001a00',
    gradientTo: '#003300',
  },
  sunset: {
    name: 'Sunset',
    primary: '#ff6b35',
    secondary: '#ff00ff',
    accent: '#ffd700',
    gradientFrom: '#1a0a0a',
    gradientTo: '#3d1a1a',
  },
  ocean: {
    name: 'Ocean',
    primary: '#00d9ff',
    secondary: '#0066ff',
    accent: '#66ffff',
    gradientFrom: '#0a1827',
    gradientTo: '#1a2d4e',
  },
  neon: {
    name: 'Neon Purple',
    primary: '#bf00ff',
    secondary: '#ff00aa',
    accent: '#ff66ff',
    gradientFrom: '#1a0a27',
    gradientTo: '#3d1a4e',
  },
  gold: {
    name: 'Royal Gold',
    primary: '#ffd700',
    secondary: '#ff8800',
    accent: '#ffee00',
    gradientFrom: '#1a1404',
    gradientTo: '#3d2a0a',
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState('cyber');
  const currentTheme = themes[themeName];

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme: setThemeName }}>
      <div
        style={{
          '--theme-primary': currentTheme.primary,
          '--theme-secondary': currentTheme.secondary,
          '--theme-accent': currentTheme.accent,
          '--theme-gradient-from': currentTheme.gradientFrom,
          '--theme-gradient-to': currentTheme.gradientTo,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
