import { factories } from '@strapi/strapi'

/**
 * PlayfulMessagePool は store / fanclub の遊び要素のコンテンツ配信に使用するため、
 * 公開済みメッセージの read API は匿名アクセスを許可する。
 */
export default factories.createCoreRouter('api::playful-message-pool.playful-message-pool', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
})
