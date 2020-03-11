// Clean up any files left behind by removed apps.
//
// When someone submits a PR to remove an app, only the `foo.yml` and `foo-icon.png`
// files are present in the repo. This script cleans up any leftover local
// artifacts that were created by `npm run build`, such as `apps/foo-icon-128.png`

const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf').sync

fs.readdirSync(path.join(__dirname, '../apps'))
  .filter(filename => {
    return fs.statSync(path.join(__dirname, `../apps/${filename}`)).isDirectory()
  })
  .filter(filename => {
    return !fs.existsSync(path.join(__dirname, `../apps/${filename}/${filename}.yml`))
  })
  .forEach(filename => {
    const appDir = path.join(__dirname, `../apps/${filename}`)
    console.log(`Removing leftover artifacts from ${appDir}`)
    rimraf(appDir)
  })
