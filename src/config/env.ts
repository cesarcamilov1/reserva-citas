export interface Env {
  apiBaseUrl: string
  providerUserId: string
}

export function loadEnv(): Env {
  const env = import.meta.env
  return {
    apiBaseUrl: env.VITE_API_BASE_URL ?? '',
    providerUserId: env.VITE_PROVIDER_USER_ID || '',
  }
}
