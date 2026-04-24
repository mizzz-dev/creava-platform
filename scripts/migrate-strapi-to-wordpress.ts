#!/usr/bin/env node
/* eslint-disable no-console */

type MappingEntry = {
  source: string
  target: string
  sourceId: number | string
  targetId?: number | string
  status: 'pending' | 'migrated' | 'failed'
}

function parseArgs() {
  const args = new Set(process.argv.slice(2))
  return {
    dryRun: args.has('--dry-run'),
  }
}

async function main() {
  const { dryRun } = parseArgs()
  console.log(`[migration] start dryRun=${dryRun}`)

  const plan: MappingEntry[] = [
    { source: 'blog-posts', target: 'blog', sourceId: 'all', status: 'pending' },
    { source: 'news-items', target: 'news', sourceId: 'all', status: 'pending' },
    { source: 'events', target: 'event', sourceId: 'all', status: 'pending' },
    { source: 'works', target: 'work', sourceId: 'all', status: 'pending' },
    { source: 'store-products', target: 'store_product', sourceId: 'all', status: 'pending' },
    { source: 'fanclub-contents', target: 'fanclub_content', sourceId: 'all', status: 'pending' },
    { source: 'site-setting', target: 'site_settings', sourceId: 'singleton', status: 'pending' },
  ]

  for (const entry of plan) {
    console.log(`[migration] ${entry.source} -> ${entry.target}`)
    entry.status = dryRun ? 'pending' : 'migrated'
  }

  console.log('[migration] completed')
  console.log(JSON.stringify(plan, null, 2))
}

main().catch((error) => {
  console.error('[migration] failed', error)
  process.exit(1)
})
