import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import * as dates from '../meta/dates.json'
import * as colors from '../meta/colors.json'
import * as releases from '../meta/releases.json'
import * as readmes from '../meta/readmes.json'
import { IApp } from '../lib/interfaces'
const parseGitHubUrl = require('github-url-to-object')
const apps: Array<IApp> = []

fs.readdirSync(path.join(__dirname, '../apps'))
  .filter((filename) => {
    return fs
      .statSync(path.join(__dirname, `../apps/${filename}`))
      .isDirectory()
  })
  .forEach((slug) => {
    const yamlFile = path.join(__dirname, `../apps/${slug}/${slug}.yml`)
    const app = Object.assign(
      { slug: slug },
      yaml.safeLoad(fs.readFileSync(yamlFile, { encoding: 'utf-8' })),
      {
        icon: `${slug}-icon.png`,
        icon32: `${slug}-icon-32.png`,
        icon64: `${slug}-icon-64.png`,
        icon128: `${slug}-icon-128.png`,
        icon256: `${slug}-icon-256.png`,
        // @ts-ignore
        date: dates[slug],
        // @ts-ignore
        iconColors: colors[slug].palette,
      },
      // @ts-ignore
      releases[slug],
      // @ts-ignore
      readmes[slug]
    )

    // @ts-ignore
    app.goodColorOnWhite = app.goodColorOnWhite || colors[slug].goodColorOnWhite
    // @ts-ignore
    app.goodColorOnBlack = app.goodColorOnBlack || colors[slug].goodColorOnBlack
    // @ts-ignore
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
  path.join(__dirname, '../index.json'),
  JSON.stringify(apps, null, 2)
)
