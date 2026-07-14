const GITHUB_USERNAME_PATTERN = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}(?<!-)$/
const LINKEDIN_USERNAME_PATTERN = /^(?!-)[A-Za-z0-9-]{3,100}(?<!-)$/

const GITHUB_HOSTS = new Set(['github.com', 'www.github.com'])
const LINKEDIN_HOSTS = new Set(['linkedin.com', 'www.linkedin.com'])

function extractUsernameFromUrl(
  value: string,
  allowedHosts: Set<string>,
  pathPrefix: string[],
) {
  try {
    const url = new URL(value)
    const pathParts = url.pathname.split('/').filter(Boolean)

    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      !allowedHosts.has(url.hostname.toLowerCase()) ||
      url.search ||
      url.hash ||
      pathParts.length !== pathPrefix.length + 1 ||
      pathPrefix.some(
        (part, index) => pathParts[index]?.toLowerCase() !== part,
      )
    ) {
      return ''
    }

    return pathParts[pathParts.length - 1] ?? ''
  } catch {
    return ''
  }
}

export function isValidGithubUsername(value: string) {
  const username = value.trim()
  return !username || GITHUB_USERNAME_PATTERN.test(username)
}

export function isValidLinkedinUsername(value: string) {
  const username = value.trim()
  return (
    !username ||
    (LINKEDIN_USERNAME_PATTERN.test(username) &&
      !username.toLowerCase().includes('linkedin'))
  )
}

export function extractGithubUsername(value: string) {
  const normalizedValue = value.trim()
  if (GITHUB_USERNAME_PATTERN.test(normalizedValue)) {
    return normalizedValue
  }

  const username = extractUsernameFromUrl(
    normalizedValue,
    GITHUB_HOSTS,
    [],
  )
  return GITHUB_USERNAME_PATTERN.test(username) ? username : ''
}

export function extractLinkedinUsername(value: string) {
  const normalizedValue = value.trim()
  if (isValidLinkedinUsername(normalizedValue) && normalizedValue) {
    return normalizedValue
  }

  const username = extractUsernameFromUrl(
    normalizedValue,
    LINKEDIN_HOSTS,
    ['in'],
  )
  return isValidLinkedinUsername(username) ? username : ''
}

export function buildGithubProfileUrl(username: string) {
  const normalizedUsername = username.trim()
  return normalizedUsername ? `https://github.com/${normalizedUsername}` : ''
}

export function buildLinkedinProfileUrl(username: string) {
  const normalizedUsername = username.trim()
  return normalizedUsername
    ? `https://www.linkedin.com/in/${normalizedUsername}`
    : ''
}
