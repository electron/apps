const fs = require('fs')
const path = require('path')
const github = require('../lib/github')
const cheerio = require('cheerio')
const parseGitUrl = require('github-url-to-object')
const Duration = require('duration')
const downloadExtensions = [
  '.deb',
  '.dmg',
  '.exe',
  '.gz',
  '.zip'
]
const apps = require('../lib/raw-app-list')()
  .filter(app => {
    if (!app.repository) {
      if (parseGitUrl(app.website)) {
        console.log(`${app.name} website is a giturl: ${app.website}`)
        app.repository = app.website
      }
    }
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
  const gitHubOptions = {
    owner: owner,
    repo: repo,
    headers: {
      Accept: 'application/vnd.github.v3.html'
    }
  }

  github.repos.getLatestRelease(gitHubOptions)
  .then(release => {
    console.log(app.slug)
    output[app.slug] = {
      latestRelease: release.data || false,
      release_fetched_at: new Date()
    }
    if (release.data) {
      output[app.slug].latestRelease = {
        releaseUrl: release.data.html_url,
        tagName: release.data.tag_name,
        releaseName: release.data.name,
        releaseNotes: release.data.body_html
      }
      output[app.slug].latestRelease.downloads = release.data.assets.filter((asset) => {
        let fileExtension = path.extname(asset.browser_download_url)
        return (downloadExtensions.indexOf(fileExtension) !== -1)
      }).map((asset) => {
        return Object.assign({
          fileName: asset.name,
          fileUrl: asset.browser_download_url
        })
      })
    }
    return github.repos.getReadme(gitHubOptions)
  }).catch(() => {
    output[app.slug] = {
      latestRelease: false
    }
    return github.repos.getReadme(gitHubOptions)
  }).then((response) => {
    let readme = response.data
    let $ = cheerio.load(readme)

    const $relativeImages = $('img').not('[src^="http"]')
    if ($relativeImages.length) {
      console.log(`Updating relative image URLs in ${app.name}`)
      $relativeImages.each((i, img) => {
        $(img).attr('src', `${app.repository}/raw/master/${$(img).attr('src')}`)
      })
    }

    output[app.slug].originalReadme = readme
    output[app.slug].readme = $('body').html()
    go()
  })
}
