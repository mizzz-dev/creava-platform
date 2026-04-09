export type AuthenticatedClerkUser = {
  userId: string
  email: string | null
  sessionId: string | null
}

type JwtPayload = {
  sub?: unknown
  sid?: unknown
  email?: unknown
  primary_email_address?: unknown
  exp?: unknown
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return Buffer.from(padded, 'base64').toString('utf8')
}

function parseBearerToken(authorization: string | undefined): string {
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Authorization Bearer トークンが必要です。')
  }

  const token = authorization.slice('Bearer '.length).trim()
  if (!token) {
    throw new Error('Authorization トークンが空です。')
  }

  return token
}

function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split('.')
  if (parts.length < 2) {
    throw new Error('JWT 形式が不正です。')
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload
  } catch {
    throw new Error('JWT payload の解析に失敗しました。')
  }
}

function pickEmail(payload: JwtPayload): string | null {
  if (typeof payload.email === 'string' && payload.email) return payload.email
  if (typeof payload.primary_email_address === 'string' && payload.primary_email_address) return payload.primary_email_address
  return null
}

function assertNotExpired(payload: JwtPayload): void {
  const exp = payload.exp
  if (typeof exp !== 'number') return

  const now = Math.floor(Date.now() / 1000)
  if (exp <= now) {
    throw new Error('JWT の有効期限が切れています。')
  }
}

export async function verifyClerkToken(authorization: string | undefined): Promise<AuthenticatedClerkUser> {
  const token = parseBearerToken(authorization)
  const payload = decodeJwtPayload(token)
  assertNotExpired(payload)

  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Clerk JWT の sub を取得できません。')
  }

  return {
    userId: payload.sub,
    email: pickEmail(payload),
    sessionId: typeof payload.sid === 'string' && payload.sid ? payload.sid : null,
  }
}
