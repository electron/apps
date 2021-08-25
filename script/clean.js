// Clean up any files left behind by removed apps.
//
// When someone submits a PR to remove an app, only the `foo.yml` and `foo-icon.png`
// files are present in the repo. This script cleans up any leftover local
// artifacts that were created by `npm run build`, such as `apps/foo-icon-128.png`

import fs from 'fs'
import rimraf from 'rimraf'
import path from 'path'
import { _dirname } from '../lib/dirname.js'

fs.readdirSync(path.join(_dirname(import.meta), '../apps'))
  .filter((filename) => {
    return fs
      .statSync(path.join(_dirname(import.meta), `../apps/${filename}`))
      .isDirectory()
  })
  .filter((filename) => {
    return !fs.existsSync(
      path.join(_dirname(import.meta), `../apps/${filename}/${filename}.yml`)
    )
  })
  .forEach((filename) => {
    const appDir = path.join(_dirname(import.meta), `../apps/${filename}`)
    console.log(`Removing leftover artifacts from ${appDir}`)
    rimraf.sync(appDir)
  })
