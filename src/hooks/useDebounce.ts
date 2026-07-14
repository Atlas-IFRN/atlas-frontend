import { useEffect, useState } from 'react'

/**
 * Retorna `value` "atrasado": só reflete a última mudança depois de `delay` ms
 * sem novas alterações. Usado para não disparar uma requisição a cada tecla na
 * busca do cabeçalho.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
