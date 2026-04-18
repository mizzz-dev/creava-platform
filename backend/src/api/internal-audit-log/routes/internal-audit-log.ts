import { requireInternalPermission } from '../../../lib/auth/internal-access'

export default {
  routes: [
    {
      method: 'GET',
      path: '/internal-audit-logs',
      handler: 'internal-audit-log.find',
      config: {
        auth: false,
        middlewares: [
          async (ctx, next) => {
            await requireInternalPermission(ctx, 'internal.audit.read')
            await next()
          },
        ],
      },
    },
  ],
}
