import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const API_ROOT = join(SCRIPT_DIR, '..', 'src', 'api')

function loadSchemas() {
  const apiDirs = readdirSync(API_ROOT, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  const schemas = []

  for (const apiDir of apiDirs) {
    const schemaPath = join(API_ROOT, apiDir.name, 'content-types', apiDir.name, 'schema.json')
    if (!existsSync(schemaPath)) continue
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'))
    schemas.push({
      path: schemaPath,
      uid: `api::${schema.info.singularName}.${schema.info.singularName}`,
      schema,
    })
  }

  return schemas.sort((a, b) => a.schema.info.singularName.localeCompare(b.schema.info.singularName))
}

const schemas = loadSchemas()

const summary = {
  generatedAt: new Date().toISOString(),
  contentTypes: schemas.length,
  collectionTypes: 0,
  singleTypes: 0,
  draftAndPublishEnabled: 0,
  attributes: 0,
  relationFields: 0,
  mediaFields: 0,
  jsonFields: 0,
  localizedFields: 0,
  uidFields: 0,
}

const details = []

for (const item of schemas) {
  const { schema, uid } = item
  const attributes = schema.attributes ?? {}
  const counters = {
    attributes: 0,
    relations: 0,
    media: 0,
    json: 0,
    localized: 0,
    uid: 0,
  }

  if (schema.kind === 'singleType') summary.singleTypes += 1
  else summary.collectionTypes += 1
  if (schema.options?.draftAndPublish) summary.draftAndPublishEnabled += 1

  const relationTargets = []

  for (const [name, attr] of Object.entries(attributes)) {
    counters.attributes += 1
    summary.attributes += 1

    if (attr.type === 'relation') {
      counters.relations += 1
      summary.relationFields += 1
      relationTargets.push({ field: name, relation: attr.relation, target: attr.target })
    }

    if (attr.type === 'media') {
      counters.media += 1
      summary.mediaFields += 1
    }

    if (attr.type === 'json') {
      counters.json += 1
      summary.jsonFields += 1
    }

    if (attr.type === 'uid') {
      counters.uid += 1
      summary.uidFields += 1
    }

    if (attr.pluginOptions?.i18n?.localized === true) {
      counters.localized += 1
      summary.localizedFields += 1
    }
  }

  details.push({
    uid,
    displayName: schema.info.displayName,
    kind: schema.kind,
    draftAndPublish: !!schema.options?.draftAndPublish,
    counters,
    relationTargets,
    riskySignals: {
      hasManyJsonFields: counters.json >= 3,
      hasDenseRelations: counters.relations >= 4,
      hasManyMediaFields: counters.media >= 4,
    },
  })
}

const output = {
  summary,
  details,
  notes: [
    'JSON field が多い content-type は component への分割余地あり',
    'relation が多い content-type は listing 用と detail 用に責務分割する',
    'media field が多い content-type は shared asset 設計と locale ルールの整理候補',
  ],
}

console.log(JSON.stringify(output, null, 2))
