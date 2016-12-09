const fs = require('fs')
const path = require('path')
const yaml = require('yamljs')
const slugg = require('slugg')
const mkdirp = require('mkdirp')
const blacklist = [
  'Electron Packager',
  'Electron Builder',
  'Spectron',
  'Devtron',
  'Electron Prebuilt',
  'Menubar'
]

const apps = yaml.load('./apps.yml')
  .filter(app => !blacklist.includes(app.name))
  .forEach(app => {
    const slug = slugg(app.name)
    const basedir = path.join(__dirname, `/apps/${slug}`)
    const ext = path.extname(app.icon)
    mkdirp(basedir)
    // fs.renameSync(
    //   path.join(__dirname, `/icons/${app.icon}`),
    //   path.join(basedir, `${slug}${ext}`)
    // )
    delete app.icon
    fs.writeFileSync(
      path.join(basedir, `${slug}.yml`),
      yaml.stringify(app, 2)
    )
  })
