const fs = require('fs')
const path = require('path')
const yaml = require('yaml')
const dates = require('../meta/dates.json')
const parseGitHubUrl = require('github-url-to-object')
const apps = []

fs.readdirSync(path.join(__dirname, '../apps'))
  .filter((filename) => {
    return fs
      .statSync(path.join(__dirname, `../apps/${filename}`))
      .isDirectory()
  })
  .forEach((slug) => {
    const yamlFile = path.join(__dirname, `../apps/${slug}/${slug}.yml`)
    const meta = yaml.parse(fs.readFileSync(yamlFile, 'utf-8'))

    if (meta.disabled) {
      return
    }

    const app = Object.assign({ slug: slug }, meta, {
      icon: `${slug}-icon.png`,
      icon32: `${slug}-icon-32.png`,
      icon64: `${slug}-icon-64.png`,
      icon128: `${slug}-icon-128.png`,
      icon256: `${slug}-icon-256.png`,
      date: dates[slug],
    })

    // Delete website if it's the same URL as repository
    const parsedWebsite = parseGitHubUrl(app.website)
    const parsedRepo = parseGitHubUrl(app.repository)
    if (
      parsedWebsite &&
      parsedRepo &&
      parsedWebsite.https_url === parsedRepo.https_url
    ) {
      delete app.website
    }

    apps.push(app)
  })

fs.writeFileSync(
  path.join(__dirname, '../index.json'),
  JSON.stringify(apps, null, 2)
)
