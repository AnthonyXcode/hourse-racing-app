#!/usr/bin/env node

/**
 * Fix OpenAPI spec issues before generating the client
 *
 * Issues fixed:
 * 1. Invalid path "/upload?id={id}" -> should be "/upload" with query param
 * 2. Add missing "preview" and "previewToken" parameters for draft/preview support
 * 3. Make "populate" parameter accept both string ("*", "deep") and object types
 */

const fs = require('fs')
const path = require('path')

const inputFile = path.resolve(__dirname, '../../../apps/strapi/src/extensions/documentation/documentation/1.0.0/full_documentation.json')
const outputFile = path.resolve(__dirname, '../full_documentation.fixed.json')

console.log('📖 Reading OpenAPI spec from:', inputFile)

const spec = JSON.parse(fs.readFileSync(inputFile, 'utf8'))

// Fix 1: Move "/upload?id={id}" to "/upload" with proper operationId
if (spec.paths['/upload?id={id}']) {
  console.log('🔧 Fixing invalid path: /upload?id={id}')

  const invalidPath = spec.paths['/upload?id={id}']

  // Add operationId to avoid method name conflicts
  if (invalidPath.post) {
    invalidPath.post.operationId = 'updateUploadFile'
    invalidPath.post.summary = 'Update file information'
  }

  // Create the correct path
  spec.paths['/upload'] = spec.paths['/upload'] || {}

  // Merge with existing /upload path
  if (spec.paths['/upload'].post) {
    console.log('⚠️  /upload POST already exists, creating /upload/{id} instead')
    spec.paths['/upload/{id}'] = {
      ...invalidPath,
      post: {
        ...invalidPath.post,
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'File id',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ]
      }
    }
  } else {
    spec.paths['/upload'].post = invalidPath.post
  }

  // Remove the invalid path
  delete spec.paths['/upload?id={id}']

  console.log('✅ Fixed: /upload?id={id} -> /upload (with operationId: updateUploadFile)')
}

// Fix 3: Enhance parameters for all GET endpoints
let previewAddCount = 0
let populateFixCount = 0

for (const [pathKey, pathValue] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(pathValue)) {
    // Only process GET operations with parameters
    if (method !== 'get' || !operation.parameters || !Array.isArray(operation.parameters)) {
      continue
    }

    // Check if this endpoint has locale parameter (indicates it's a content endpoint)
    const hasLocale = operation.parameters.some(p => p.name === 'locale')
    if (!hasLocale) {
      continue
    }

    // Fix 2: Add preview and previewToken parameters if not present
    const hasPreview = operation.parameters.some(p => p.name === 'preview')
    const hasPreviewToken = operation.parameters.some(p => p.name === 'previewToken')

    if (!hasPreview) {
      operation.parameters.push({
        name: 'preview',
        in: 'query',
        description: 'Enable preview mode to fetch draft content. Set to "true" to enable.',
        deprecated: false,
        required: false,
        schema: {
          type: 'string',
          enum: ['true', 'false']
        }
      })
      previewAddCount++
    }

    if (!hasPreviewToken) {
      operation.parameters.push({
        name: 'previewToken',
        in: 'query',
        description: 'Preview token for authentication when preview mode is enabled.',
        deprecated: false,
        required: false,
        schema: {
          type: 'string'
        }
      })
    }

    // Fix 4: Make populate parameter accept both string and object
    const populateParam = operation.parameters.find(p => p.name === 'populate')
    if (populateParam && populateParam.schema) {
      // Update schema to accept string or object using oneOf
      populateParam.schema = {
        oneOf: [
          { type: 'string', description: 'Use "*" to populate all relations or "deep" for deep population' },
          { type: 'object', description: 'Object specifying which relations to populate' }
        ]
      }
      populateParam.description = 'Relations to populate. Can be a string ("*" or "deep") or an object for selective population.'
      populateFixCount++
    }
  }
}

if (previewAddCount > 0) {
  console.log(`🔧 Added "preview" and "previewToken" parameters to ${previewAddCount} endpoints`)
}

if (populateFixCount > 0) {
  console.log(`🔧 Fixed "populate" parameter to accept string or object in ${populateFixCount} endpoints`)
}

// Write the fixed spec
console.log('💾 Writing fixed spec to:', outputFile)
fs.writeFileSync(outputFile, JSON.stringify(spec, null, 2))

console.log('✅ OpenAPI spec fixed successfully!')
