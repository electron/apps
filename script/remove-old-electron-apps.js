#!/usr/bin/env node

const fs = require('fs').promises
const semver = require('semver')

const findOldElectronApps = require('../lib/old-electron')

/* Links can break at any time and it's outside of the repo's control,
   so it doesn't make sense to run this script as part of CI. Instead,
   this should be run periodically as part of a separate process. */

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

const numberArgs = process.argv.filter((v) => /^\d+$/.test(v))
const possibleStart =
  numberArgs.length > 0 ? parseInt(numberArgs[0], 10) : undefined
const possibleEnd =
  numberArgs.length > 0 ? parseInt(numberArgs[1], 10) : undefined

console.log(
  `Checking apps ${possibleStart || 0} through ${
    possibleEnd || 'infinity'
  } for old electron apps`
)

async function main() {
  const oldArrays = (
    await findOldElectronApps(possibleStart, possibleEnd)
  ).filter((old) => {
    if (old.result === undefined) return false
    try {
      return semver.lt(old.result, '4.0.0')
    } catch (err) {
      return false
    }
  })

  console.log(`Will disable ${oldArrays.length} entries`)

  for (const old of oldArrays) {
    console.timeLog(old.entry.name)
    let data = await fs.readFile(old.entry.fullPath, { encoding: 'utf-8' })

    if (!data.endsWith('\n')) {
      data += `\n`
    }

    data += `disabled: true # Old Electron version: v${old.result}\n`

    await fs.writeFile(old.entry.fullPath, data, { encoding: 'utf-8' })

    console.log(data)
    console.log(`\n---\n`)
  }
}

main()
