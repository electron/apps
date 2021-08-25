import fs from 'fs'
import Bottleneck from 'bottleneck'
import github from '../lib/github.js'
import cheerio from 'cheerio'
import parseGitUrl from 'github-url-to-object'
import humanInterval from 'human-interval'
import apps from '../lib/raw-app-list.js'
import appsWithRepos from '../lib/apps-with-github-repos.js'
import path from 'path'
import { _dirname } from '../lib/dirname.js'

const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY) || 4 // simultaneous open web requests
const README_CACHE_TTL = humanInterval(
  process.env.README_CACHE_TTL || '4 hours'
)

const outputFile = path.join(_dirname(import.meta), '../meta/readmes.json')
const oldReadmeData = JSON.parse(fs.readFileSync(outputFile))

const output = {}
const limiter = new Bottleneck({
  maxConcurrent: MAX_CONCURRENCY,
})

const appsToUpdate = appsWithRepos.filter((app) => {
  const oldData = oldReadmeData[app.slug]
  if (!oldData) return true
  const oldDate = new Date(oldData.readmeFetchedAt || null).getTime()
  return oldDate + README_CACHE_TTL < Date.now()
})

console.log(
  `${appsWithRepos.length} of ${apps.length} apps have a GitHub repo.`
)
console.log(
  `${appsToUpdate.length} of those ${appsWithRepos.length} have missing or outdated README data.`
)

appsToUpdate.forEach((app) => {
  limiter
    .schedule(getReadme, app)
    .then((repository) => {
      return repository.data.default_branch
    })
    .catch((err) => {
      if (err.status !== 404) {
        console.error(`${app.slug}: Non 404 error`)
        console.error(err)
      }

      return
    })
    .then((defaultBranch) => {
      limiter
        .schedule(getReadme, app, defaultBranch)
        .then((release) => {
          console.log(`${app.slug}: got latest README`)
          output[app.slug] = {
            readmeCleaned: cleanReadme(release.data, defaultBranch, app),
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
          if (err.status !== 404) {
            console.error(`${app.slug}: Non 404 error`)
            console.error(err)
          }
        })
    })
})

limiter.on('idle', () => {
  setTimeout(() => {
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2))
    console.log(`Done fetching README files.\nWrote ${outputFile}`)
    process.exit()
  }, 1000)
})

function getReadme(app, defaultBranch) {
  const { user: owner, repo } = parseGitUrl(app.repository)
  const opts = {
    owner: owner,
    repo: repo,
    headers: {
      Accept: 'application/vnd.github.v3.html',
    },
  }

  if (defaultBranch) {
    return github.repos.getReadme(opts)
  }

  return github.repos.get(opts)
}

function cleanReadme(readme, defaultBranch, app) {
  const $ = cheerio.load(readme)

  const $relativeImages = $('img').not('[src^="http"]')
  if ($relativeImages.length) {
    console.log(
      `${app.slug}: updating ${$relativeImages.length} relative image URLs`
    )
    $relativeImages.each((i, img) => {
      $(img).attr(
        'src',
        `${app.repository}/raw/${defaultBranch}/${$(img).attr('src')}`
      )
    })
  }

  const $relativeLinks = $('a').not('[href^="http"]')
  if ($relativeLinks.length) {
    console.log(`${app.slug}: updating ${$relativeLinks.length} relative links`)
    $relativeLinks.each((i, link) => {
      $(link).attr(
        'href',
        `${app.repository}/blob/${defaultBranch}/${$(link).attr('href')}`
      )
    })
  }

  return $('body').html()
}
