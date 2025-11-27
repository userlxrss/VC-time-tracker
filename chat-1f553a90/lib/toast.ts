/**
 * Toast utilities that work outside React components
 * For use in non-React contexts or when you need a static API
 */

import { ToastType, ToastOptions } from './toast-types'

// Store global toast functions
let globalToastFunctions: {
  success: (title: string, options?: ToastOptions) => string
  error: (title: string, options?: ToastOptions) => string
  warning: (title: string, options?: ToastOptions) => string
  info: (title: string, options?: ToastOptions) => string
  custom: (type: ToastType, title: string, options?: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
} | null = null

/**
 * Register global toast functions (called by ToastProvider)
 */
export function registerToastFunctions(functions: typeof globalToastFunctions) {
  globalToastFunctions = functions
}

/**
 * Unregister global toast functions (called by ToastProvider on unmount)
 */
export function unregisterToastFunctions() {
  globalToastFunctions = null
}

/**
 * Static toast API that can be used outside React components
 */
export const toast = {
  success: (title: string, options?: ToastOptions) => {
    if (!globalToastFunctions) {
      console.warn('Toast provider not initialized. Make sure ToastProvider wraps your app.')
      return ''
    }
    return globalToastFunctions.success(title, options)
  },

  error: (title: string, options?: ToastOptions) => {
    if (!globalToastFunctions) {
      console.warn('Toast provider not initialized. Make sure ToastProvider wraps your app.')
      return ''
    }
    return globalToastFunctions.error(title, options)
  },

  warning: (title: string, options?: ToastOptions) => {
    if (!globalToastFunctions) {
      console.warn('Toast provider not initialized. Make sure ToastProvider wraps your app.')
      return ''
    }
    return globalToastFunctions.warning(title, options)
  },

  info: (title: string, options?: ToastOptions) => {
    if (!globalToastFunctions) {
      console.warn('Toast provider not initialized. Make sure ToastProvider wraps your app.')
      return ''
    }
    return globalToastFunctions.info(title, options)
  },

  custom: (type: ToastType, title: string, options?: ToastOptions) => {
    if (!globalToastFunctions) {
      console.warn('Toast provider not initialized. Make sure ToastProvider wraps your app.')
      return ''
    }
    return globalToastFunctions.custom(type, title, options)
  },

  dismiss: (id: string) => {
    if (!globalToastFunctions) {
      console.warn('Toast provider not initialized. Make sure ToastProvider wraps your app.')
      return
    }
    globalToastFunctions.dismiss(id)
  },

  dismissAll: () => {
    if (!globalToastFunctions) {
      console.warn('Toast provider not initialized. Make sure ToastProvider wraps your app.')
      return
    }
    globalToastFunctions.dismissAll()
  },
}