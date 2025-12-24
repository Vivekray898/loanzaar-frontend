#!/usr/bin/env node

const { execSync } = require('child_process')

function getStagedAddedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=A', {
      encoding: 'utf8'
    })
    return output.split('\n').map(s => s.trim()).filter(Boolean)
  } catch (e) {
    console.warn('[pre-commit] Warning: could not inspect staged files.')
    return []
  }
}

function main() {
  const files = getStagedAddedFiles()

  // ❌ Block new files in legacy pages directory
  const blockedLegacy = files.filter(
    f =>
      /^src\/pages\//.test(f) &&
      !/^src\/pages\/(README\.md|COPILOT_GUIDE\.md)$/.test(f)
  )

  if (blockedLegacy.length > 0) {
    console.error('\n❌ New files under legacy directory detected:')
    blockedLegacy.forEach(f => console.error('  - ' + f))
    console.error('\nThis folder is legacy-only. Do NOT add new files under src/pages.\n')
    console.error('Use the Next.js App Router under src/app/ instead.')
    process.exit(1)
  }

  // ⚠️ Warn (do not block) if new JSX files are added outside legacy
  const jsxWarnings = files.filter(
    f =>
      f.endsWith('.jsx') &&
      !f.startsWith('src/pages/')
  )

  if (jsxWarnings.length > 0) {
    console.warn('\n⚠️ JSX files detected:')
    jsxWarnings.forEach(f => console.warn('  - ' + f))
    console.warn('\nPreferred convention: use .tsx for all new components and pages.')
    console.warn('JSX is allowed only for legacy files.\n')
  }

  process.exit(0)
}

main()
