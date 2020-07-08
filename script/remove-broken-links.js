#!/usr/bin/env node
const fs = require('fs-extra')
const path = require('path')
const { argv } = require('yargs')

const findBrokenLinks = require('../lib/broken-links')

/* Links can break at any time and it's outside of the repo's control,
   so it doesn't make sense to run this script as part of CI. Instead,
   this should be run periodically as part of a separate process. */

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

function isRateLimited(failures = []) {
  return failures.every(({ status }) => status === 429)
}

async function disableBrokenLinks(failArrays) {
  for (const failure of failArrays) {
    const deadLinks = failure.result.map(({ url }) => url).join(', ')
    let data = await fs.readFile(failure.entry.fullPath, { encoding: 'utf-8' })

    if (!data.endsWith('\n')) {
      data += `\n`
    }

    data += `disabled: true # Dead link(s): ${deadLinks}\n`

    await fs.writeFile(failure.entry.fullPath, data, { encoding: 'utf-8' })

    console.log(data)
    console.log(`\n---\n`)
  }
}

async function deleteBrokenLinks(failArrays) {
  for (const failure of failArrays) {
    const { fullPath } = failure.entry
    const dir = path.dirname(fullPath)
    await fs.remove(dir)
  }
}

async function main() {
  // Process command line args
  const { delete: willDelete, start, end } = argv

  console.log(
    `Checking apps ${start || 0} through ${end || 'infinity'} for broken links`
  )
  const failArrays = (await findBrokenLinks(start, end)).filter((failure) => {
    return !isRateLimited(failure.result)
  })

  console.log(
    `Will ${willDelete ? 'delete' : 'disable'} ${failArrays.length} entries`
  )

  if (willDelete) {
    await deleteBrokenLinks(failArrays)
  } else {
    await disableBrokenLinks(failArrays)
  }
}

main()
