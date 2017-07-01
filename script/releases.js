console.log('Fetching release data for apps that have a GitHub repo...')

const fs = require('fs')
const path = require('path')
const github = require('../lib/github')
const parseGitUrl = require('github-url-to-object')
const apps = require('../lib/raw-app-list')()
  .filter(app => app.repository && parseGitUrl(app.repository))
const outputFile = path.join(__dirname, '../meta/releases.json')
const output = {}
let i = -1

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
    output[app.slug] = releases.data
    go()
  })
}
