const test = require('tape')
const path = require('path')
const exists = require('path-exists').sync
const apps = require('.')

test('apps', function (t) {
  t.ok(Array.isArray(apps), 'is an array')
  t.ok(apps.length > 80, 'has lots of apps in it')

  apps.forEach(app => {
    t.comment(app.name)
    t.ok(app.name.length > 0, 'has a name')
    const iconPath = path.join(__dirname, `/icons/${app.icon}`)
    t.ok(
      app.icon && exists(iconPath),
      'has an icon file'
    )
    t.ok(app.datauri.length > 0, 'has a datauri')
  })

  t.end()
})
