const fs = require('fs')
const path = require('path')
const yaml = require('yamljs')
const execSync = require('child_process').execSync
const datesPath = path.join(__dirname, '../meta/dates.json')
const dates = require(datesPath)
const existingSlugs = Object.keys(dates)
const apps = require('../lib/raw-app-list')()

console.log('Checking app submission dates...')

apps
  .filter(app => existingSlugs.indexOf(app.slug) === -1 )
  .forEach(app => {
    // https://git-scm.com/docs/pretty-formats
    cmd = `git log -S "${app.website}" --pretty=format:'%ci' | tail -n1`
    const date = String(execSync(cmd)).slice(0, 10)
    console.log(`${app.slug}: ${date}`)
    dates[app.slug] = date
  })

fs.writeFileSync(datesPath, JSON.stringify(dates, null, 2))
