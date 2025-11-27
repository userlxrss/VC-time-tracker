import { useTheme } from 'next-themes'

export function useThemeMode() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isDark = resolvedTheme === 'dark'

  return {
    theme,
    setTheme,
    resolvedTheme,
    toggleTheme,
    isDark,
  }
}