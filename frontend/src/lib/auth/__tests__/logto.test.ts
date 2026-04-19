import { describe, expect, it } from 'vitest'
import { toAppUserFromLogtoClaims } from '../logto'

describe('toAppUserFromLogtoClaims', () => {
  it('roles 配列から role を解決する', () => {
    const result = toAppUserFromLogtoClaims({
      sub: 'user_123',
      email: 'member@example.com',
      email_verified: true,
      roles: ['member'],
      membershipStatus: 'member',
      memberPlan: 'premium',
      contractStatus: 'active',
    })

    expect(result.role).toBe('member')
    expect(result.membershipStatus).toBe('member')
    expect(result.memberPlan).toBe('premium')
    expect(result.emailVerified).toBe(true)
  })

  it('未知の値は安全側で guest/free/active にフォールバックする', () => {
    const result = toAppUserFromLogtoClaims({
      sub: 'user_456',
      role: 'unknown',
      memberPlan: 'unknown',
      contractStatus: 'unknown',
    })

    expect(result.role).toBe('guest')
    expect(result.membershipStatus).toBe('non_member')
    expect(result.memberPlan).toBe('free')
    expect(result.contractStatus).toBe('active')
  })
})
