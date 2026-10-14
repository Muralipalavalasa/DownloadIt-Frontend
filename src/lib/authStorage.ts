const ACCESS_TOKEN_KEY = 'downloadit_access_token'

export const getAccessToken = (): string | null => sessionStorage.getItem(ACCESS_TOKEN_KEY)

export const setAccessToken = (token: string): void => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const clearAccessToken = (): void => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}