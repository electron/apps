const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY) || 4 // simultaneous open web requests
const README_CACHE_TTL = require('human-interval')(
  process.env.README_CACHE_TTL || '4 hours'
)

import * as fs from 'fs'
import * as path from 'path'
import { github } from '../lib/github'
import { IApp, IReadmesOutput } from '../lib/interfaces'
import { apps } from '../lib/raw-app-list'
import { appsWithRepos } from '../lib/apps-with-github-repos'
import * as cheerio from 'cheerio'

const Bottleneck = require('bottleneck')
const parseGitUrl = require('github-url-to-object')

const outputFile = path.join(__dirname, '../meta/readmes.json')
const oldReadmeData = require(outputFile)
const output: Record<string, IReadmesOutput> = {}
const limiter = new Bottleneck(MAX_CONCURRENCY)

const appsToUpdate = appsWithRepos.filter((app: IApp) => {
  const oldData = oldReadmeData[app.slug]
  if (!oldData) return true
  const oldDate = new Date(oldData.readmeFetchedAt || null).getTime()
  return oldDate + README_CACHE_TTL < Date.now()
})

console.log(`${appsWithRepos.length} of ${apps().length} apps have a GitHub repo.`)
console.log(`${appsToUpdate.length} of those ${appsWithRepos.length} have missing or outdated README data.`)

appsToUpdate.forEach((app) => {
  limiter.schedule(getReadme, app)
})

limiter.on('idle', () => {
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2))
  console.log(`Done fetching README files.\nWrote ${outputFile}`)
  process.exit()
})

function getReadme (app: IApp) {
  const {user: owner, repo} = parseGitUrl(app.repository)
  const opts = {
    owner: owner,
    repo: repo,
    headers: {
      Accept: 'application/vnd.github.v3.html',
    },
  }

  return github.repos
    .getReadme(opts)
    .then((release) => {
      console.log(`${app.slug}: got latest README`)
      output[app.slug] = {
        readmeCleaned: cleanReadme(release.data, app),
        readmeOriginal: release.data,
        readmeFetchedAt: new Date(),
      }
    })
    .catch((err) => {
      console.error(`${app.slug}: no README found`)
      output[app.slug] = {
        readmeOriginal: null,
        readmeFetchedAt: new Date(),
      }
      if (err.code !== 404) console.error(err)
    })
}

function cleanReadme (readme: unknown, app: IApp) {
  const $ = cheerio.load(readme as string)

  const $relativeImages = $('img').not('[src^="http"]')
  if ($relativeImages.length) {
    console.log(`${app.slug}: updating ${$relativeImages.length} relative image URLs`)
    $relativeImages.each((_i, img) => {
      $(img).attr('src', `${app.repository}/raw/master/${$(img).attr('src')}`)
    })
  }

  const $relativeLinks = $('a').not('[href^="http"]')
  if ($relativeLinks.length) {
    console.log(`${app.slug}: updating ${$relativeLinks.length} relative links`)
    $relativeLinks.each((i, link) => {
      $(link).attr(
        'href',
        `${app.repository}/blob/master/${$(link).attr('href')}`
      )
    })
  }

  return $('body').html()
}
