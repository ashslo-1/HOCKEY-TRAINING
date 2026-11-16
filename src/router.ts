import { useEffect, useState } from 'react'

// Minimal hash router. Hash URLs (#/training) work on GitHub Pages without server rewrites.

export const ROUTES = ['/', '/training', '/schedule', '/stats', '/about', '/contact'] as const
export type Route = (typeof ROUTES)[number]

function readPath(): string {
  const raw = window.location.hash.replace(/^#/, '')
  const path = raw.split('?')[0] || '/'
  return path.startsWith('/') ? path : `/${path}`
}

export function useRoute(): string {
  const [path, setPath] = useState(readPath)
  useEffect(() => {
    const onChange = () => setPath(readPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export function navigate(path: string) {
  if (readPath() === path) window.scrollTo({ top: 0, behavior: 'smooth' })
  else window.location.hash = path
}

