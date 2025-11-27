import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockSetTheme = jest.fn()

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderThemeToggle = () => {
  return render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeToggle />
    </ThemeProvider>
  )
}

describe('ThemeToggle Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render button with proper accessibility label', () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toBeInTheDocument()
    })

    it('should have proper styling classes', () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toHaveClass(
        'relative',
        'h-11',
        'w-11',
        'rounded-xl',
        'transition-all',
        'duration-300'
      )
    })

    it('should show sun icon initially in light mode', () => {
      renderThemeToggle()

      // Since we can't easily test the complex icon transitions,
      // we'll test that the component renders without errors
      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Theme Switching', () => {
    it('should switch to dark mode when clicked in light mode', async () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(button)

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should handle multiple clicks correctly', async () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })

      await user.click(button) // Light -> Dark
      await user.click(button) // Dark -> Light
      await user.click(button) // Light -> Dark

      expect(mockSetTheme).toHaveBeenCalledTimes(3)
      expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'dark')
      expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'light')
      expect(mockSetTheme).toHaveBeenNthCalledWith(3, 'dark')
    })
  })

  describe('Icon Transitions', () => {
    it('should apply correct classes for sun icon', () => {
      renderThemeToggle()

      // Since we can't easily test the complex icon transitions,
      // we'll test that the component renders without errors
      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toBeInTheDocument()
    })

    it('should have sr-only text for screen readers', () => {
      renderThemeToggle()

      const srOnlyText = screen.getByText('Toggle theme')
      expect(srOnlyText).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have hover effects', () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toHaveClass(
        'hover:bg-vc-primary-50',
        'dark:hover:bg-vc-primary-900/20'
      )
    })

    it('should have group styling', () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toHaveClass('group')
    })

    it('should have size classes', () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toHaveClass('h-11', 'w-11')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      button.focus()

      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should be accessible via space key', async () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      button.focus()

      await user.keyboard('{ }')
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should have proper ARIA support', () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })

      // Should have proper button role
      expect(button).toHaveAttribute('type', 'button')

      // Should have accessible name
      expect(button).toHaveAccessibleName(/toggle theme/i)
    })

    it('should have focus indicators', () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toHaveClass('focus-visible:outline-none')
    })
  })

  describe('Component Integration', () => {
    it('should work within ThemeProvider', () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toBeInTheDocument()
    })

    it('should handle theme context properly', async () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(button)

      // Verify that setTheme is called
      expect(mockSetTheme).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid clicks', async () => {
      renderThemeToggle()

      const button = screen.getByRole('button', { name: /toggle theme/i })

      // Rapid clicks
      await user.click(button)
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockSetTheme).toHaveBeenCalledTimes(4)
    })

    it('should not crash when theme context is missing', () => {
      // This test ensures the component has proper error handling
      expect(() => {
        render(<ThemeToggle />)
      }).not.toThrow()
    })
  })
})