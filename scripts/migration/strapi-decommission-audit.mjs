#!/usr/bin/env node
/* eslint-disable no-console */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import crypto from 'node:crypto'

const ROOT = process.cwd()

const REQUIRED_PATHS = [
  'frontend/src/lib/cms',
  'frontend/src/modules/blog/api.ts',
  'frontend/src/modules/news/api.ts',
  'frontend/src/modules/events/api.ts',
  'frontend/src/modules/works/api.ts',
  'frontend/src/modules/store/api.ts',
  'frontend/src/modules/fanclub/api.ts',
  'frontend/src/modules/settings/api.ts',
  'frontend/src/modules/discovery',
  'frontend/src/lib/stripe/checkout.ts',
  'frontend/src/modules/payments/api.ts',
  'wordpress/wp-content/plugins/creava-platform-core',
  'scripts/migrate-strapi-to-wordpress.ts',
  'scripts/migration',
  'docs/wordpress-migration.md',
  '.github/workflows',
]

const SCAN_DIRECTORIES = [
  'frontend/src/lib/cms',
  'frontend/src/modules',
  'backend/src',
  'backend/config',
  'wordpress/wp-content/plugins/creava-platform-core',
  'scripts',
  '.github/workflows',
  'docs',
]

const RULES = [
  { category: 'runtime_endpoint', severity: 'critical', pattern: /VITE_STRAPI_API_URL|\/api\/cms-sync\/strapi-webhook|strapiapp\.com/i, label: 'Strapi runtime endpoint' },
  { category: 'secret_or_env', severity: 'high', pattern: /STRAPI_DEPLOY_TOKEN|STRAPI_PUBLISH_WEBHOOK_SECRET|VITE_STRAPI_API_TOKEN/i, label: 'Strapi secret/env key' },
  { category: 'workflow_or_job', severity: 'high', pattern: /deploy-backend|pm2\s+reload\s+strapi|deploy-target.*strapi_cloud/i, label: 'Strapi deploy/job path' },
  { category: 'code_path', severity: 'medium', pattern: /from ['"].*\/cms\/strapi|provider\s*===\s*['"]strapi['"]|VITE_CMS_PROVIDER=strapi/i, label: 'Strapi provider fallback path' },
  { category: 'docs_reference', severity: 'low', pattern: /Strapi 管理画面|Strapi運用|Strapi backend/i, label: 'Legacy Strapi docs reference' },
]

const TEXT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml', '.env', '.php']

function parseArgs() {
  const args = process.argv.slice(2)
  const includeDocs = !args.includes('--exclude-docs')
  const reportArg = args.find((arg) => arg.startsWith('--report='))
  const reportPath = reportArg
    ? resolve(ROOT, reportArg.replace('--report=', ''))
    : resolve(ROOT, `scripts/migration/reports/decommission-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)

  return { reportPath, includeDocs }
}

function walkFiles(pathname, acc) {
  const abs = resolve(ROOT, pathname)
  let stats
  try {
    stats = statSync(abs)
  } catch {
    return
  }

  if (stats.isFile()) {
    acc.push(abs)
    return
  }

  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') continue
    const next = resolve(abs, entry.name)
    if (entry.isDirectory()) walkFiles(relative(ROOT, next), acc)
    else if (entry.isFile()) acc.push(next)
  }
}

function isTextFile(pathname) {
  if (pathname.endsWith('.env.example')) return true
  return TEXT_EXTENSIONS.some((ext) => pathname.endsWith(ext))
}

function getRequiredPathState(pathname) {
  try {
    statSync(resolve(ROOT, pathname))
    return 'present'
  } catch {
    return 'missing'
  }
}

function collectFindings(files, includeDocs) {
  const findings = []

  for (const absPath of files) {
    const rel = relative(ROOT, absPath)
    if (!includeDocs && rel.startsWith('docs/')) continue
    if (!isTextFile(rel)) continue

    const body = readFileSync(absPath, 'utf-8')
    const lines = body.split(/\r?\n/)
    lines.forEach((line, index) => {
      RULES.forEach((rule) => {
        if (!rule.pattern.test(line)) return
        findings.push({
          category: rule.category,
          severity: rule.severity,
          file: rel,
          line: index + 1,
          pattern: rule.label,
          excerpt: line.trim().slice(0, 220),
        })
      })
    })
  }

  return findings
}

function summarizeBySeverity(findings) {
  return findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1
      return acc
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  )
}

function summarizeByCategory(findings) {
  return findings.reduce(
    (acc, finding) => {
      acc[finding.category] += 1
      return acc
    },
    {
      runtime_endpoint: 0,
      secret_or_env: 0,
      workflow_or_job: 0,
      code_path: 0,
      docs_reference: 0,
    },
  )
}

function buildState(findings) {
  const severity = summarizeBySeverity(findings)
  const runtimeCritical = findings.some((item) => item.category === 'runtime_endpoint' && item.severity === 'critical')
  const workflowHigh = findings.some((item) => item.category === 'workflow_or_job' && (item.severity === 'critical' || item.severity === 'high'))

  return {
    strapiShutdownState: runtimeCritical ? 'blocked' : 'ready_for_execution',
    decommissionExecutionState: 'audit_completed',
    residualDependencyState: runtimeCritical || workflowHigh ? 'unresolved' : 'resolved_or_documented',
    cleanupState: findings.length > 0 ? 'action_required' : 'completed',
    secretCleanupState: findings.some((item) => item.category === 'secret_or_env') ? 'action_required' : 'completed',
    infraCleanupState: workflowHigh ? 'action_required' : 'completed',
    fallbackBoundaryState: 'document_required',
    rollbackBoundaryState: 'document_required',
    postCutoverState: 'observation_window_required',
    unresolvedDependencyCount: findings.length,
    unresolvedCriticalCount: severity.critical,
    unresolvedHighCount: severity.high,
    unresolvedMediumCount: severity.medium,
    unresolvedLowCount: severity.low,
  }
}

async function main() {
  const options = parseArgs()
  const scanFiles = []
  for (const dir of SCAN_DIRECTORIES) walkFiles(dir, scanFiles)

  const findings = collectFindings(scanFiles, options.includeDocs)
  const decommissionTraceId = crypto.randomUUID()
  const startedAt = new Date().toISOString()
  const states = buildState(findings)
  const completedAt = new Date().toISOString()

  const requiredPathCheck = REQUIRED_PATHS.map((pathname) => ({
    path: pathname,
    state: getRequiredPathState(pathname),
  }))

  const report = {
    decommissionTraceId,
    decommissionStartedAt: startedAt,
    decommissionCompletedAt: completedAt,
    decommissionVerifiedAt: completedAt,
    ...states,
    requiredPathCheck,
    residualSummary: {
      bySeverity: summarizeBySeverity(findings),
      byCategory: summarizeByCategory(findings),
    },
    residualDependencies: findings.slice(0, 500),
    unresolvedDependencies: findings.filter((item) => item.severity === 'critical' || item.severity === 'high').slice(0, 300),
    shutdownChecklist: [
      'critical/high 残依存がゼロであることを確認',
      'deploy workflow が WordPress 単独運用フローへ切り替わっていること',
      'preview/publish/revalidation 失敗時 runbook を運用チームに展開済みであること',
      'rollback boundary と observation window が文書化済みであること',
    ],
  }

  mkdirSync(resolve(ROOT, 'scripts/migration/reports'), { recursive: true })
  writeFileSync(options.reportPath, `${JSON.stringify(report, null, 2)}\n`)

  console.log(`[decommission-audit] report=${options.reportPath}`)
  console.log(`[decommission-audit] traceId=${decommissionTraceId}`)
  console.log(`[decommission-audit] unresolved=${findings.length}`)
}

main().catch((error) => {
  console.error('[decommission-audit] failed', error)
  process.exit(1)
})
