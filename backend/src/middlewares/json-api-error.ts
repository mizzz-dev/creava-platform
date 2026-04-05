import type { Core } from '@strapi/strapi'

type AnyError = Error & {
  status?: number
  statusCode?: number
  details?: unknown
}

function shouldForceJson(path: string): boolean {
  return path.startsWith('/api/') || path.startsWith('/content-manager/') || path.startsWith('/upload/')
}

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    try {
      await next()

      if (!shouldForceJson(ctx.path)) return

      const contentType = ctx.response.get('content-type') || ''
      if (typeof ctx.body === 'string' && contentType.includes('text/html')) {
        strapi.log.error(`[json-api-error] HTML response intercepted: ${ctx.method} ${ctx.path}`)
        ctx.type = 'application/json'
        ctx.status = ctx.status >= 400 ? ctx.status : 500
        ctx.body = {
          error: {
            name: 'NonJsonResponseError',
            message: 'HTML レスポンスを返却していたため JSON エラーへ正規化しました。',
            details: {
              path: ctx.path,
              method: ctx.method,
            },
          },
        }
      }
    } catch (err) {
      const error = err as AnyError
      const status = error.status ?? error.statusCode ?? 500

      if (!shouldForceJson(ctx.path)) {
        throw err
      }

      strapi.log.error(`[json-api-error] ${ctx.method} ${ctx.path} failed: ${error.message}`)
      ctx.type = 'application/json'
      ctx.status = status
      ctx.body = {
        error: {
          name: error.name || 'StrapiRequestError',
          message: error.message || 'Unexpected error',
          details: error.details ?? {},
        },
      }
    }
  }
}
