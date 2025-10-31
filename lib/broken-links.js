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
const scrape = (url) =>
  fetch(url, { method: 'HEAD' }) // just scrape headers; body not needed
    .then(
      (res) => ({
        url,
        err: res.ok ? null : `${res.status} ${res.statusText}`,
        status: res.status,
      }),
      (err) => ({ url, err, status: -2 })
    )

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
    .then((o) => (o.disabled ? [] : getObjectUrls(o)))
    .then(async (urls) => {
      const results = []

      for (const url of urls) {
        // Scrape one by one to handle rate limiting
        const r = await scrape(url)
        results.push(r)
      }

      return results
    })
    .then((results) => results.filter((res) => !!res.err))
    .then((fails) => {
      fails.forEach((f) => console.log(`${entry.path} - ${f.url} (${f.err})`))
      return fails
    })

const findBrokenLinks = (start = 0, end = Infinity) =>
  readdirp
    .promise(topDir, {
      fileFilter: '*.yml',
      directoryFilter: (entry) => entry.path.startsWith('apps'),
    })
    .then(async (entries) => {
      const result = []
      let limitedEntries = entries.reverse()

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
    .then((arr) => arr.filter((inner) => !!inner.result.length))

module.exports = findBrokenLinks
