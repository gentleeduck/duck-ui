'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { Command, KeyHandler, Registry } from '../command'
import { KeyContextValue } from './command.types'

/**
 * A React context that holds the key command registry and handler.
 * Consumers can register commands and interact with the keyboard system.
 */
export const KeyContext = createContext<KeyContextValue | null>(null)

/**
 * Provides a `KeyContext` to its children and attaches a global key handler.
 *
 * @param {object} props - Props for the provider.
 * @param {boolean} [props.debug=false] - Enable debug logging for key events.
 * @param {number} [props.timeoutMs=600] - Timeout between key sequence inputs in milliseconds.
 * @param {ReactNode} props.children - Child components that can access key command functionality.
 *
 * @example
 * ```tsx
 * <KeyProvider debug timeoutMs={500}>
 *   <App />
 * </KeyProvider>
 * ```
 */
export const KeyProvider: React.FC<{ debug?: boolean; timeoutMs?: number; children: ReactNode }> = ({
  debug = false,
  timeoutMs = 600,
  children,
}: {
  debug?: boolean
  timeoutMs?: number
  children: ReactNode
}) => {
  const registry = new Registry(debug)
  const handler = new KeyHandler(registry, timeoutMs)

  useEffect(() => {
    handler.attach()
    return () => handler.detach()
  }, [handler])

  return <KeyContext.Provider value={{ registry, handler }}>{children}</KeyContext.Provider>
}

/**
 * React hook to register one or more key-command mappings using the global key registry.
 *
 * @param {Record<string, Command>} commands - A record of key sequences and their corresponding commands.
 *
 * @example
 * ```tsx
 * useKeyCommands({
 *   'g+d': {
 *     name: 'Go to Dashboard',
 *     execute: () => navigate('/dashboard'),
 *   },
 *   'ctrl+k': {
 *     name: 'Open Command Palette',
 *     execute: () => setOpen(true),
 *   }
 * })
 * ```
 *
 * > Note: Must be used within a `KeyProvider`.
 */
export function useKeyCommands(commands: Record<string, Command>): void {
  const ctx = useContext(KeyContext)
  useEffect(() => {
    if (!ctx) {
      console.warn('useKeyCommands must be used within a KeyProvider')
      return
    }

    for (const [seq, cmd] of Object.entries(commands)) {
      ctx.registry.register(seq, cmd)
    }

    // Cleanup would go here if unregistering was supported
  }, [ctx, commands])
}
