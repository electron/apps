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
const getObjectUrls = root => {
  const urls = []

  let stack = [ root ]
  while (stack.length !== 0) {
    const o = stack.shift()
    for (val of Object.values(o)) {
      if (typeof val === 'string' && val.startsWith('https://'))
        urls.push(val)
      else if (typeof val === 'object')
        stack.push(val)
    }
  }

  return urls
}

const getYmlUrls = filename => getObjectUrls(yaml.load(filename))

const reqs = []
let numBroken = 0

const rootDir = path.join(__dirname, '..')
const appsDir = path.join(rootDir, 'apps')
const appFiles = rreaddir(appsDir).filter(file => file.endsWith('.yml'))

for (const file of appFiles) {
  const relPath = path.relative(rootDir, file)
  for (const link of getYmlUrls(file)) {
    //console.log(`${link} ${file}`)
    reqs.push(fetch(link, {method: 'HEAD'})
      .then(response => {
        if (response.ok) return
        console.log(`${relPath} - ${link} (${response.status} ${response.statusText})`)
        ++numBroken
      })
      .catch(error => {
        console.log(`${relPath} - ${link} (${error})`)
        ++numBroken
      }))
  }
}

Promise.all(reqs).then(() => process.exit(numBroken))
