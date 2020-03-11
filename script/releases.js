const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY) || 4 // simultaneous open web requests
const RELEASE_CACHE_TTL = require('human-interval')(process.env.RELEASE_CACHE_TTL || '4 hours')

const fs = require('fs')
const path = require('path')
const Bottleneck = require('bottleneck')
const github = require('../lib/github')
const parseGitUrl = require('github-url-to-object')

const outputFile = path.join(__dirname, '../meta/releases.json')
const oldReleaseData = require(outputFile)
const output = {}
const limiter = new Bottleneck(MAX_CONCURRENCY)

const apps = require('../lib/raw-app-list')()
const appsWithRepos = require('../lib/apps-with-github-repos')

console.log(`${appsWithRepos.length} of ${apps.length} apps have a GitHub repo.`)
console.log(`${appsWithRepos.filter(shouldUpdateAppReleaseData).length} of those ${appsWithRepos.length} have missing or outdated release data.`)

appsWithRepos.forEach(app => {
  if (shouldUpdateAppReleaseData(app)) {
    limiter.schedule(getLatestRelease, app)
  } else {
    output[app.slug] = oldReleaseData[app.slug]
  }
})

limiter.on('idle', () => {
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2))
  console.log(`Done fetching release data.\nWrote ${outputFile}`)
  process.exit()
})

function shouldUpdateAppReleaseData (app) {
  const oldData = oldReleaseData[app.slug]
  if (!oldData || !oldData.latestReleaseFetchedAt) return true
  const oldDate = new Date(oldData.latestReleaseFetchedAt || null).getTime()
  return oldDate + RELEASE_CACHE_TTL < Date.now()
}

function getLatestRelease (app) {
  const {user: owner, repo} = parseGitUrl(app.repository)
  const opts = {
    owner: owner,
    repo: repo,
    headers: {
      Accept: 'application/vnd.github.v3.html'
    }
  }

  return github.repos.getLatestRelease(opts)
    .then(release => {
      console.log(`${app.slug}: got latest release`)
      output[app.slug] = {
        latestRelease: release.data,
        latestReleaseFetchedAt: new Date()
      }
    }).catch(err => {
      console.error(`${app.slug}: no releases found`)
      output[app.slug] = {
        latestRelease: null,
        latestReleaseFetchedAt: new Date()
      }
      if (err.code !== 404) console.error(err)
    })
}
