import { requireInternalPermission } from '../../../lib/auth/internal-access'

type Site = 'main' | 'store' | 'fc' | 'cross'

function toLimit(raw: unknown, fallback = 30): number {
  const n = Number(raw)
  if (!Number.isFinite(n)) return fallback
  return Math.max(1, Math.min(200, Math.round(n)))
}

function inferEnvironment(): 'local' | 'staging' | 'production' {
  const nodeEnv = String(process.env.NODE_ENV ?? '').toLowerCase()
  if (nodeEnv === 'production') return 'production'
  if (nodeEnv === 'staging') return 'staging'
  return 'local'
}

function inferSourceSite(payload: any): Site {
  const site = payload?.metadata?.sourceSite ?? payload?.sourceSite
  if (site === 'main' || site === 'store' || site === 'fc' || site === 'cross') return site
  return 'cross'
}

async function createAuditLog(strapi: any, input: {
  actorLogtoUserId: string
  actorInternalRoles: string[]
  action: string
  targetType: string
  targetId: string
  reason: string
  sourceSite?: Site
  metadata?: Record<string, unknown>
}): Promise<any> {
  return strapi.documents('api::internal-audit-log.internal-audit-log').create({
    data: {
      actorLogtoUserId: input.actorLogtoUserId,
      actorInternalRoles: input.actorInternalRoles,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      status: 'success',
      reason: input.reason,
      sourceSite: input.sourceSite ?? 'cross',
      metadata: input.metadata ?? {},
    },
  })
}

export default ({ strapi }) => ({
  async overview(ctx) {
    try {
      await requireInternalPermission(ctx, 'internal.user.read')
      const [webhooks, deliveries, deadLetters, syncRuns] = await Promise.all([
        strapi.documents('api::webhook-event-log.webhook-event-log').findMany({ sort: ['createdAt:desc'], limit: 200 }),
        strapi.documents('api::delivery-log.delivery-log').findMany({ sort: ['createdAt:desc'], limit: 200 }),
        strapi.documents('api::dead-letter-item.dead-letter-item').findMany({ sort: ['createdAt:desc'], limit: 200 }),
        strapi.documents('api::sync-run.sync-run').findMany({ sort: ['createdAt:desc'], limit: 200 }),
      ])

      const connectorMap: Record<string, {
        connectorType: string
        connectorKey: string
        inbound: { total: number; failed: number; latestSuccessAt: string | null; latestFailureAt: string | null }
        outbound: { total: number; failed: number; latestSuccessAt: string | null; latestFailureAt: string | null }
        deadLetters: number
        healthState: 'healthy' | 'degraded' | 'unhealthy'
        sourceSites: Site[]
      }> = {}

      const ensure = (connectorType: string, connectorKey: string) => {
        const key = `${connectorType}:${connectorKey}`
        if (!connectorMap[key]) {
          connectorMap[key] = {
            connectorType,
            connectorKey,
            inbound: { total: 0, failed: 0, latestSuccessAt: null, latestFailureAt: null },
            outbound: { total: 0, failed: 0, latestSuccessAt: null, latestFailureAt: null },
            deadLetters: 0,
            healthState: 'healthy',
            sourceSites: [],
          }
        }
        return connectorMap[key]
      }

      for (const row of webhooks as any[]) {
        const connector = ensure(String(row.provider ?? 'unknown'), String(row.provider ?? 'unknown'))
        connector.inbound.total += 1
        const failed = String(row.status ?? '') === 'failed'
        if (failed) {
          connector.inbound.failed += 1
          connector.inbound.latestFailureAt = connector.inbound.latestFailureAt ?? (row.updatedAt ?? row.createdAt ?? null)
        } else {
          connector.inbound.latestSuccessAt = connector.inbound.latestSuccessAt ?? (row.updatedAt ?? row.createdAt ?? null)
        }
        const sourceSite = inferSourceSite(row)
        if (!connector.sourceSites.includes(sourceSite)) connector.sourceSites.push(sourceSite)
      }

      for (const row of deliveries as any[]) {
        const connector = ensure('notification', String(row.channel ?? 'unknown'))
        connector.outbound.total += 1
        const failed = String(row.status ?? '') === 'failed'
        if (failed) {
          connector.outbound.failed += 1
          connector.outbound.latestFailureAt = connector.outbound.latestFailureAt ?? (row.updatedAt ?? row.createdAt ?? null)
        } else if (String(row.status ?? '') === 'sent') {
          connector.outbound.latestSuccessAt = connector.outbound.latestSuccessAt ?? (row.sentAt ?? row.updatedAt ?? row.createdAt ?? null)
        }
        const sourceSite = inferSourceSite(row)
        if (!connector.sourceSites.includes(sourceSite)) connector.sourceSites.push(sourceSite)
      }

      for (const row of deadLetters as any[]) {
        const connector = ensure(String(row.connectorType ?? 'unknown'), String(row.connectorKey ?? 'unknown'))
        connector.deadLetters += 1
      }

      const connectors = Object.values(connectorMap).map((item) => {
        const errorScore = item.inbound.failed + item.outbound.failed + item.deadLetters
        const healthState = errorScore >= 5 ? 'unhealthy' : errorScore >= 1 ? 'degraded' : 'healthy'
        return { ...item, healthState }
      }).sort((a, b) => b.deadLetters - a.deadLetters)

      const reconciliationLatest = (syncRuns as any[]).find((row) => String(row.syncDirection) === 'reconciliation')

      ctx.body = {
        generatedAt: new Date().toISOString(),
        environment: inferEnvironment(),
        connectors,
        summary: {
          inboundFailed: (webhooks as any[]).filter((row) => String(row.status ?? '') === 'failed').length,
          outboundFailed: (deliveries as any[]).filter((row) => String(row.status ?? '') === 'failed').length,
          deadLetters: (deadLetters as any[]).length,
          replayPending: await strapi.documents('api::replay-request.replay-request').count({ filters: { status: { $in: ['requested', 'running'] } } }),
        },
        latestReconciliation: reconciliationLatest ?? null,
      }
    } catch (error) {
      const message = (error as Error).message
      if (message.includes('Internal permission denied')) return ctx.forbidden('integration overview の権限がありません。')
      strapi.log.error(`[integration-console] overview failed: ${message}`)
      return ctx.internalServerError('integration overview の取得に失敗しました。')
    }
  },

  async inboundEvents(ctx) {
    try {
      await requireInternalPermission(ctx, 'internal.user.read')
      const limit = toLimit(ctx.query.limit, 50)
      const status = String(ctx.query.status ?? '').trim()
      const provider = String(ctx.query.provider ?? '').trim()
      const filters: Record<string, unknown> = {}
      if (status) filters.status = { $eq: status }
      if (provider) filters.provider = { $eq: provider }

      const rows = await strapi.documents('api::webhook-event-log.webhook-event-log').findMany({
        filters,
        sort: ['createdAt:desc'],
        limit,
      })

      ctx.body = {
        count: rows.length,
        items: (rows as any[]).map((row) => ({
          id: row.documentId,
          provider: row.provider,
          eventId: row.eventId,
          eventType: row.eventType,
          status: row.status,
          receivedAt: row.createdAt,
          processedAt: row.processedAt ?? null,
          errorMessage: row.errorMessage ?? null,
          sourceSite: inferSourceSite(row),
        })),
      }
    } catch (error) {
      const message = (error as Error).message
      if (message.includes('Internal permission denied')) return ctx.forbidden('inbound events の権限がありません。')
      strapi.log.error(`[integration-console] inboundEvents failed: ${message}`)
      return ctx.internalServerError('inbound events の取得に失敗しました。')
    }
  },

  async outboundDeliveries(ctx) {
    try {
      await requireInternalPermission(ctx, 'internal.user.read')
      const limit = toLimit(ctx.query.limit, 50)
      const status = String(ctx.query.status ?? '').trim()
      const channel = String(ctx.query.channel ?? '').trim()
      const filters: Record<string, unknown> = {}
      if (status) filters.status = { $eq: status }
      if (channel) filters.channel = { $eq: channel }

      const rows = await strapi.documents('api::delivery-log.delivery-log').findMany({ filters, sort: ['createdAt:desc'], limit })
      ctx.body = {
        count: rows.length,
        items: (rows as any[]).map((row) => ({
          id: row.documentId,
          channel: row.channel,
          templateKey: row.templateKey,
          userId: row.userId,
          status: row.status,
          idempotencyKey: row.idempotencyKey ?? null,
          sentAt: row.sentAt ?? null,
          errorReason: row.errorReason ?? null,
          sourceSite: row.sourceSite ?? 'cross',
          locale: row.locale ?? 'ja',
        })),
      }
    } catch (error) {
      const message = (error as Error).message
      if (message.includes('Internal permission denied')) return ctx.forbidden('outbound deliveries の権限がありません。')
      strapi.log.error(`[integration-console] outboundDeliveries failed: ${message}`)
      return ctx.internalServerError('outbound deliveries の取得に失敗しました。')
    }
  },

  async deadLetters(ctx) {
    try {
      await requireInternalPermission(ctx, 'internal.user.read')
      const limit = toLimit(ctx.query.limit, 50)
      const severity = String(ctx.query.severity ?? '').trim()
      const connectorType = String(ctx.query.connectorType ?? '').trim()
      const filters: Record<string, unknown> = {}
      if (severity) filters.severity = { $eq: severity }
      if (connectorType) filters.connectorType = { $eq: connectorType }

      const rows = await strapi.documents('api::dead-letter-item.dead-letter-item').findMany({ filters, sort: ['createdAt:desc'], limit })
      ctx.body = {
        count: rows.length,
        items: rows,
      }
    } catch (error) {
      const message = (error as Error).message
      if (message.includes('Internal permission denied')) return ctx.forbidden('dead letters の権限がありません。')
      strapi.log.error(`[integration-console] deadLetters failed: ${message}`)
      return ctx.internalServerError('dead letters の取得に失敗しました。')
    }
  },

  async replayRequests(ctx) {
    try {
      await requireInternalPermission(ctx, 'internal.user.read')
      const limit = toLimit(ctx.query.limit, 50)
      const rows = await strapi.documents('api::replay-request.replay-request').findMany({ sort: ['createdAt:desc'], limit })
      ctx.body = { count: rows.length, items: rows }
    } catch (error) {
      const message = (error as Error).message
      if (message.includes('Internal permission denied')) return ctx.forbidden('replay requests の権限がありません。')
      strapi.log.error(`[integration-console] replayRequests failed: ${message}`)
      return ctx.internalServerError('replay requests の取得に失敗しました。')
    }
  },

  async requestReplay(ctx) {
    try {
      const access = await requireInternalPermission(ctx, 'internal.user.update')
      const { targetType, targetId, connectorType, sourceSite, runMode, reason } = ctx.request.body ?? {}
      if (!targetType || !targetId || !connectorType || !reason) return ctx.badRequest('targetType/targetId/connectorType/reason は必須です。')

      const safeMode = runMode !== 'dangerous'
      const replay = await strapi.documents('api::replay-request.replay-request').create({
        data: {
          targetType,
          targetId: String(targetId),
          connectorType: String(connectorType),
          sourceSite: sourceSite === 'main' || sourceSite === 'store' || sourceSite === 'fc' ? sourceSite : 'cross',
          runMode: safeMode ? 'safe' : 'dangerous',
          safeMode,
          status: 'requested',
          reason: String(reason),
          requestedBy: access.authUser.userId,
          metadata: {
            requestedAt: new Date().toISOString(),
            actorInternalRoles: access.internalRoles,
          },
        },
      })

      if (targetType === 'dead_letter') {
        const dead = await strapi.documents('api::dead-letter-item.dead-letter-item').findOne({ documentId: String(targetId) })
        if (dead?.documentId) {
          await strapi.documents('api::dead-letter-item.dead-letter-item').update({
            documentId: dead.documentId,
            data: {
              status: 'retrying',
              retryCount: Number(dead.retryCount ?? 0) + 1,
              nextRetryAt: new Date(Date.now() + 60_000).toISOString(),
            },
          })
        }
      }

      const audit = await createAuditLog(strapi, {
        actorLogtoUserId: access.authUser.userId,
        actorInternalRoles: access.internalRoles,
        action: 'integration.replay.request',
        targetType: 'replay_request',
        targetId: replay.documentId,
        reason: String(reason),
        sourceSite: sourceSite,
        metadata: { targetType, targetId, connectorType, runMode: safeMode ? 'safe' : 'dangerous' },
      })

      await strapi.documents('api::replay-request.replay-request').update({
        documentId: replay.documentId,
        data: { auditLogRef: audit.documentId },
      })

      ctx.body = { ok: true, replayRequestId: replay.documentId, auditLogId: audit.documentId }
    } catch (error) {
      const message = (error as Error).message
      if (message.includes('Internal permission denied')) return ctx.forbidden('replay request の権限がありません。')
      strapi.log.error(`[integration-console] requestReplay failed: ${message}`)
      return ctx.internalServerError('replay request の登録に失敗しました。')
    }
  },

  async runReconciliation(ctx) {
    try {
      const access = await requireInternalPermission(ctx, 'internal.user.update')
      const { reason, sourceSite } = ctx.request.body ?? {}
      if (!reason) return ctx.badRequest('reason は必須です。')

      const [orders, revenues, subscriptions, entitlements] = await Promise.all([
        strapi.documents('api::order.order').findMany({ limit: 1000, sort: ['createdAt:desc'] }),
        strapi.documents('api::revenue-record.revenue-record').findMany({ limit: 1000, sort: ['createdAt:desc'] }),
        strapi.documents('api::subscription-record.subscription-record').findMany({ limit: 1000, sort: ['createdAt:desc'] }),
        strapi.documents('api::entitlement-record.entitlement-record').findMany({ limit: 1000, sort: ['createdAt:desc'] }),
      ])

      const paidOrders = new Set((orders as any[]).filter((row) => row.paymentStatus === 'paid').map((row) => String(row.paymentIntentId ?? row.checkoutSessionId ?? row.documentId)))
      const revenuePayments = new Set((revenues as any[]).map((row) => String(row.paymentId ?? row.orderId ?? row.documentId)))
      const subscriptionIds = new Set((subscriptions as any[]).map((row) => String(row.subscriptionId ?? row.documentId)))
      const entitlementSubscriptionIds = new Set((entitlements as any[]).map((row) => String(row.subscriptionId ?? row.documentId)))

      const missingRevenue = Array.from(paidOrders).filter((id) => !revenuePayments.has(id))
      const orphanRevenue = Array.from(revenuePayments).filter((id) => !paidOrders.has(id))
      const missingEntitlement = Array.from(subscriptionIds).filter((id) => !entitlementSubscriptionIds.has(id))

      const run = await strapi.documents('api::sync-run.sync-run').create({
        data: {
          integration: 'cross-domain-reconciliation',
          connectorType: 'internal',
          connectorKey: 'financial-and-membership',
          syncDirection: 'reconciliation',
          runMode: 'reconciliation',
          safeMode: true,
          sourceOfTruth: 'order+revenue+subscription+entitlement',
          sourceSite: sourceSite === 'main' || sourceSite === 'store' || sourceSite === 'fc' ? sourceSite : 'cross',
          environment: inferEnvironment(),
          status: missingRevenue.length || orphanRevenue.length || missingEntitlement.length ? 'partial' : 'succeeded',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          stats: {
            missingRevenueCount: missingRevenue.length,
            orphanRevenueCount: orphanRevenue.length,
            missingEntitlementCount: missingEntitlement.length,
            samples: {
              missingRevenue: missingRevenue.slice(0, 10),
              orphanRevenue: orphanRevenue.slice(0, 10),
              missingEntitlement: missingEntitlement.slice(0, 10),
            },
          },
          ownerTeam: 'operations',
          healthState: missingRevenue.length + missingEntitlement.length > 10 ? 'unhealthy' : missingRevenue.length + missingEntitlement.length > 0 ? 'degraded' : 'healthy',
        },
      })

      const audit = await createAuditLog(strapi, {
        actorLogtoUserId: access.authUser.userId,
        actorInternalRoles: access.internalRoles,
        action: 'integration.reconciliation.run',
        targetType: 'sync_run',
        targetId: run.documentId,
        reason: String(reason),
        sourceSite,
        metadata: { missingRevenueCount: missingRevenue.length, orphanRevenueCount: orphanRevenue.length, missingEntitlementCount: missingEntitlement.length },
      })

      await strapi.documents('api::sync-run.sync-run').update({
        documentId: run.documentId,
        data: { auditLogRef: audit.documentId },
      })

      ctx.body = {
        ok: true,
        runId: run.documentId,
        summary: {
          missingRevenueCount: missingRevenue.length,
          orphanRevenueCount: orphanRevenue.length,
          missingEntitlementCount: missingEntitlement.length,
        },
        samples: {
          missingRevenue: missingRevenue.slice(0, 10),
          orphanRevenue: orphanRevenue.slice(0, 10),
          missingEntitlement: missingEntitlement.slice(0, 10),
        },
      }
    } catch (error) {
      const message = (error as Error).message
      if (message.includes('Internal permission denied')) return ctx.forbidden('reconciliation run の権限がありません。')
      strapi.log.error(`[integration-console] runReconciliation failed: ${message}`)
      return ctx.internalServerError('reconciliation run に失敗しました。')
    }
  },
})
