const fs = require('fs')
const path = require('path')
const github = require('../lib/github')
const parseGitUrl = require('github-url-to-object')
const Duration = require('duration')
const apps = require('../lib/raw-app-list')()
  .filter(app => {
    if (!app.repository) return false
    if (!parseGitUrl(app.repository)) return false
    let age = new Duration(new Date(app.releases_fetched_at || null), new Date())
    if (age.hours < 24) return false
    return true
  })
const outputFile = path.join(__dirname, '../meta/releases.json')
const output = {}
let i = -1

// Don't fetch release data too often
const outputFileAgeInHours = (new Date() - new Date(fs.statSync(outputFile).mtime)) / 1000 / 60
if (outputFileAgeInHours < 1) {
  console.log('Release data was updated less than an hour ago; skipping')
  process.exit()
} else {
  console.log('Fetching release data for apps that have a GitHub repo...')
}

go()

function go () {
  ++i

  if (i === apps.length) {
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2))
    process.exit()
  }

  const app = apps[i]
  const {user: owner, repo} = parseGitUrl(app.repository)

  github.repos.getReleases({
    owner: owner,
    repo: repo,
    per_page: 100
  })
  .then(releases => {
    console.log(app.slug)
    output[app.slug] = {
      releases: releases.data || [],
      releases_fetched_at: new Date()
    }
    go()
  })
}
