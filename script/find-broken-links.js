#!/usr/bin/env node

/* Links can break at any time and it's outside of the repo's control,
   so it doesn't make sense to put this into CI. Instead, this should
   be periodically as part of a separate periodic process. */

/* TODO: should this do anything corrective as well?
   e.g. if all the links in a file are dead, disable the file? */

const fetch = require('node-fetch')
const path = require('path')
const process = require('process')
const rreaddir = require('recursive-readdir-sync')
const yaml = require('yamljs')

// simple object walker that looks for https://... strings
const getObjectUrls = (root) => {
  const urls = []

  let stack = [ root ]
  while (stack.length !== 0) {
    const o = stack.shift()
    for (const val of Object.values(o)) {
      if (typeof val === 'string' && val.startsWith('https://')) { urls.push(val) } else if (typeof val === 'object') { stack.push(val) }
    }
  }

  return urls
}

const getYmlUrls = (filename) => getObjectUrls(yaml.load(filename))

const topDir = path.join(__dirname, '..')
const appsDir = path.join(topDir, 'apps')
const appFiles = rreaddir(appsDir).filter(file => file.endsWith('.yml'))
const fetchOpts = {
  method: 'HEAD' /* headers only; don't GET body */
}

let numBroken = 0
Promise
  .all(appFiles.flatMap(file =>
    getYmlUrls(file).map(url =>
      fetch(url, fetchOpts)
        .then((resp) => {
          if (resp.ok) return
          console.log(`${path.relative(topDir, file)} - ${url} (${resp.status} ${resp.statusText})`)
          ++numBroken
        }, (error) => {
          console.log(`${path.relative(topDir, file)} - ${url} (${error})`)
          ++numBroken
        }))))
  .then(() => process.exit(numBroken))
