#!/usr/bin/env node

/* Links can break at any time and it's outside of the repo's control,
   so it doesn't make sense to run this script as part of CI. Instead,
   this should be run periodically as part of a separate process. */

/* TODO: should this do anything corrective as well?
   e.g. if all the links in a file are dead, disable the file? */

const fetch = require('node-fetch')
const fsPromises = require('fs').promises
const isUrl = require('is-url')
const path = require('path')
const process = require('process')
const readdirp = require('readdirp')
const yaml = require('yamljs')

// walk an object subtree looking for URL strings
const getObjectUrls = (root) => {
  const urls = []
  const queue = [root]
  while (queue.length !== 0) {
    const vals = Object.values(queue.shift())
    urls.push(...vals.filter(isUrl))
    queue.push(...vals.filter((v) => typeof v === 'object'))
  }
  return urls
}

// scrape a url to see if the link is broken.
// return a Promise that resolves as { url, err }
const scrape = (url) =>
  fetch(url, { method: 'HEAD' }) // just scrape headers; body not needed
    .then(
      (res) => ({
        url,
        err: res.ok ? null : `${res.status} ${res.statusText}`,
      }),
      (err) => ({ url, err })
    )

// scrape all the urls found in a yml file.
// report broken links to console.log().
// return a Promise that resolves as an array of broken links: [ { url, err }, ... ]
const processYmlEntry = (entry) =>
  fsPromises
    .readFile(entry.fullPath, { encoding: 'utf8' })
    .then(yaml.parse)
    .then((o) => (o.disabled ? [] : getObjectUrls(o)))
    .then((urls) => urls.map(scrape))
    .then((scrapePromises) => Promise.all(scrapePromises))
    .then((results) => results.filter((res) => !!res.err))
    .then((fails) => {
      fails.forEach((f) => console.log(`${entry.path} - ${f.url} (${f.err})`))
      return fails
    })

const topDir = path.dirname(__dirname)
readdirp
  .promise(topDir, {
    fileFilter: '*.yml',
    directoryFilter: (entry) => entry.path.startsWith('apps'),
  })
  .then((entries) => entries.map(processYmlEntry))
  .then((processPromises) => Promise.all(processPromises))
  .then((failArrays) => failArrays.flat())
  .then((fails) => process.exit(fails.length))
