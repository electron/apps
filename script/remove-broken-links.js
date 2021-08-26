#!/usr/bin/env node

const fs = require('fs').promises

const findBrokenLinks = require('../lib/broken-links')

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
  } for broken links`
)

function isRateLimited(failures = []) {
  return failures.every(({ status }) => status === 429)
}

async function main() {
  const failArrays = (await findBrokenLinks(possibleStart, possibleEnd)).filter(
    (failure) => {
      return !isRateLimited(failure.result)
    }
  )

  console.log(`Will disable ${failArrays.length} entries`)

  for (const failure of failArrays) {
    console.timeLog(failure.result)
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

main()
