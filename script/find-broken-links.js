#!/usr/bin/env node

import findBrokenLinks from '../lib/broken-links.js'

/* Links can break at any time and it's outside of the repo's control,
   so it doesn't make sense to run this script as part of CI. Instead,
   this should be run periodically as part of a separate process. */

/* TODO: should this do anything corrective as well?
   e.g. if all the links in a file are dead, disable the file? */

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

findBrokenLinks(possibleStart, possibleEnd)
  .then((failArrays) => {
    console.log(`${failArrays.length} failure groups`)
    return failArrays.flat()
  })
  .then((fails) => process.exit(fails.length))
