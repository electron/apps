const fs = require('fs')
const path = require('path')
const yaml = require('yamljs')
const execSync = require('child_process').execSync
const datesPath = path.join(__dirname, '../dates.json')
const dates = require(datesPath)
const existingSlugs = Object.keys(dates)

console.log('Checking app submission dates...')

fs.readdirSync(path.join(__dirname, '../apps'))
  .filter(filename => {
    return fs.statSync(path.join(__dirname, `../apps/${filename}`)).isDirectory()
  })
  .filter(slug => !existingSlugs.includes(slug))
  .forEach(slug => {
    const yamlFile = path.join(__dirname, `../apps/${slug}/${slug}.yml`)
    const app = yaml.load(yamlFile)
    // https://git-scm.com/docs/pretty-formats
    cmd = `git log -S "${app.website}" --pretty=format:'%cI' | tail -n1`
    var date = String(execSync(cmd)).slice(0, 10)
    console.log(`${slug}: ${date}`)
    dates[slug] = date
  })

fs.writeFileSync(datesPath, JSON.stringify(dates, null, 2))
