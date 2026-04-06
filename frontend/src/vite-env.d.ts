/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAPI_API_URL: string
  readonly VITE_STRAPI_API_TOKEN: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_CLERK_SOCIAL_GOOGLE_ENABLED: string
  readonly VITE_CLERK_SOCIAL_APPLE_ENABLED: string
  readonly VITE_CLERK_SOCIAL_X_ENABLED: string
  readonly VITE_CLERK_SOCIAL_FACEBOOK_ENABLED: string
  readonly VITE_SHOPIFY_STORE_DOMAIN: string
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
