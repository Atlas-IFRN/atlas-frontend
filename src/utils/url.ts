/** Valida uma URL opcional: vazia é válida; se preenchida, precisa ser http(s). */
export function isValidOptionalUrl(value: string) {
  if (!value.trim()) {
    return true
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
