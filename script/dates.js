const fs = require('fs')
const path = require('path')
const datesPath = path.join(__dirname, '../meta/dates.json')
const dates = require(datesPath)
const existingSlugs = Object.keys(dates)
const apps = require('../lib/raw-app-list')()

console.log('Checking app submission dates...')

apps
  .filter((app) => existingSlugs.indexOf(app.slug) === -1)
  .forEach((app) => {
    const date = new Date().toISOString().slice(0, 10)
    console.log(`${app.slug}: ${date}`)
    dates[app.slug] = date
  })

fs.writeFileSync(datesPath, JSON.stringify(dates, null, 2))
