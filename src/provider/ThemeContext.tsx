import { createContext } from 'react';
import { Theme } from './ThemeProvider';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({ theme: "light", toggleTheme: () => { } });