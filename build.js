const path = require('path')
const Datauri = require('datauri').sync
const yaml = require('yamljs')
const blacklist = [
  'Electron Packager',
  'Electron Builder',
  'Spectron',
  'Devtron',
  'Electron Prebuilt',
  'Menubar'
]

const apps = yaml.load('./apps.yml')
  .filter(app => blacklist.indexOf(app.name) === -1)
  .map(app => {
    app.datauri = Datauri(path.join(__dirname, `/icons/${app.icon}`))
    return app
  })

process.stdout.write(JSON.stringify(apps, null, 2))
