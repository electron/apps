import fs from 'fs'
import apps from '../lib/raw-app-list.js'
import path from 'path'
import { _dirname } from '../lib/dirname.js'

const datesPath = path.join(_dirname(import.meta), '../meta/dates.json')
const dates = JSON.parse(fs.readFileSync(datesPath))
const existingSlugs = Object.keys(dates)

console.log('Checking app submission dates...')

apps
  .filter((app) => existingSlugs.indexOf(app.slug) === -1)
  .forEach((app) => {
    const date = new Date().toISOString().slice(0, 10)
    console.log(`${app.slug}: ${date}`)
    dates[app.slug] = date
  })

fs.writeFileSync(datesPath, JSON.stringify(dates, null, 2))
