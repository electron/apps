import fs from 'fs'
import yaml from 'js-yaml'
import parseGitHubUrl from 'github-url-to-object'
import path from 'path'
import { _dirname } from '../lib/dirname.js'

const dates = JSON.parse(
  fs.readFileSync(path.join(_dirname(import.meta), '../meta/dates.json'))
)
const colors = JSON.parse(
  fs.readFileSync(path.join(_dirname(import.meta), '../meta/colors.json'))
)
const releases = JSON.parse(
  fs.readFileSync(path.join(_dirname(import.meta), '../meta/releases.json'))
)
const readmes = JSON.parse(
  fs.readFileSync(path.join(_dirname(import.meta), '../meta/readmes.json'))
)

const apps = []

fs.readdirSync(path.join(_dirname(import.meta), '../apps'))
  .filter((filename) => {
    return fs
      .statSync(path.join(_dirname(import.meta), `../apps/${filename}`))
      .isDirectory()
  })
  .forEach((slug) => {
    const yamlFile = path.join(
      _dirname(import.meta),
      `../apps/${slug}/${slug}.yml`
    )
    const meta = yaml.load(fs.readFileSync(yamlFile))

    if (meta.disabled) {
      return
    }

    const app = Object.assign(
      { slug: slug },
      meta,
      {
        icon: `${slug}-icon.png`,
        icon32: `${slug}-icon-32.png`,
        icon64: `${slug}-icon-64.png`,
        icon128: `${slug}-icon-128.png`,
        icon256: `${slug}-icon-256.png`,
        date: dates[slug],
        iconColors: colors[slug].palette,
      },
      releases[slug],
      readmes[slug]
    )

    app.goodColorOnWhite = app.goodColorOnWhite || colors[slug].goodColorOnWhite
    app.goodColorOnBlack = app.goodColorOnBlack || colors[slug].goodColorOnBlack
    app.faintColorOnWhite =
      app.faintColorOnWhite || colors[slug].faintColorOnWhite

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
  path.join(_dirname(import.meta), '../index.json'),
  JSON.stringify(apps, null, 2)
)
