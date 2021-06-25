const fetch = require('node-fetch')
const fsPromises = require('fs').promises
const isUrl = require('is-url')
const path = require('path')
const readdirp = require('readdirp')
const yaml = require('yaml')

const topDir = path.dirname(__dirname)

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
const scrape = (url) => {
  const package =
    'https://raw.githubusercontent.com/' +
    url.replace(/^.*com/g, '').replace(/.git$/g, '') +
    '/master/package.json'

  return fetch(package, { method: 'GET' })
    .then((res) => (res.status === 200 ? res.json() : {}))
    .then((json) => {
      let version
      if (json.hasOwnProperty('devDependencies')) {
        if (json.devDependencies.hasOwnProperty('electron'))
          version = json.devDependencies.electron
            .replace(/^\^/g, '')
            .replace(/^~/g, '')
      }
      if (json.hasOwnProperty('dependencies')) {
        if (json.dependencies.hasOwnProperty('electron'))
          version = json.dependencies.electron
            .replace(/^\^/g, '')
            .replace(/^~/g, '')
      }

      return version
    })
}

// scrape all the urls found in a yml file.
// report broken links to console.log().
// return a Promise that resolves as an array of broken links: [ { url, err }, ... ]
const processYmlEntry = (entry) =>
  fsPromises
    .readFile(entry.fullPath, { encoding: 'utf8' })
    .then((file) => {
      try {
        return yaml.parse(file)
      } catch (error) {
        console.error(`Failed to parse ${entry.path}. Skipping.`)
        return { disabled: true }
      }
    })
    .then((o) => (o.disabled ? undefined : o.repository))
    .then(async (url) => (url ? await scrape(url) : undefined))
    .then((version) => {
      version
        ? console.log(`${entry.path} - Electron v${version}`)
        : console.log(`${entry.path} - Closed Source`)
      return version
    })

const findOldElectronApps = (start = 0, end = Infinity) =>
  readdirp
    .promise(topDir, {
      fileFilter: '*.yml',
      directoryFilter: (entry) => entry.path.startsWith('apps'),
    })
    .then(async (entries) => {
      const result = []
      let limitedEntries = entries

      if (start !== 0 || end !== Infinity) {
        limitedEntries = entries.slice(start, end)
      }

      for (const entry of limitedEntries) {
        console.log(`Processing ${entry.path}`)
        result.push({
          entry,
          result: await processYmlEntry(entry),
        })
      }

      return result
    })

module.exports = findOldElectronApps
