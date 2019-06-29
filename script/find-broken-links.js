#!/usr/bin/env node

/* Links can break at any time and it's outside of the repo's control,
   so it doesn't make sense to put this into CI. Instead, this should
   be periodically as part of a separate periodic process. */

/* TODO: should this do anything corrective as well?
   e.g. if all the links in a file are dead, disable the file? */

const fetch = require('node-fetch')
const path = require('path')
const process = require('process')
const rreaddir = require('recursive-readdir')
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

const fetchOpts = {
  method: 'HEAD' /* headers only; don't GET body */
}

const scrape = (file, url) => {
  const logerror = (msg) => console.log(`${path.relative(topDir, file)} - ${url} (${msg})`)
  return fetch(url, fetchOpts).then((resp) => {
    if (!resp.ok) logerror(`${resp.status} ${resp.statusText}`)
    return resp.ok
  }, (error) => {
    logerror(error)
    return false
  })
}

const appsDir = path.join(topDir, 'apps')
rreaddir(appsDir)
  .then(files => files.filter(file => file.endsWith('.yml')))
  .then(files => files.flatMap(file => getYmlUrls(file).map((url) => [ file, url ])))
  .then(fileUrlPairs => Promise.all(fileUrlPairs.map(([ file, url ]) => scrape(file, url))))
  .then(oks => process.exit(oks.filter(ok => !ok).length))

