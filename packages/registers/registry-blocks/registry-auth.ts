import type { RegistryEntry } from '../registry-schema'

// Every auth block takes these parts; a block that takes more names them.
const AUTH_REGISTRY_DEPS = ['button', 'input', 'avatar', 'separator', 'label'] as const

function auth(name: string, subcat: 'signup' | 'login', extraDeps: string[] = []): RegistryEntry {
  return {
    categories: ['authentications', subcat],
    files: [],
    name,
    registryDependencies: [...AUTH_REGISTRY_DEPS, ...extraDeps],
    root_folder: `authentications/${name}`,
    type: 'registry:block',
  }
}

export const registryAuth: RegistryEntry[] = [
  // Signup
  auth('signup-1', 'signup', ['checkbox']),

  // Login
  auth('login-1', 'login', ['card']),
  auth('login-2', 'login'),
  auth('login-3', 'login', ['card']),
  auth('login-4', 'login', ['card']),
  auth('login-5', 'login'),
]
