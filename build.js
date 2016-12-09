const fs = require('fs')
const path = require('path')
const yaml = require('yamljs')
const imageExtensions = ['png', 'svg']
const apps = []

fs.readdirSync(path.join(__dirname, 'apps')).forEach(slug => {
  const yamlFile = path.join(__dirname, `apps/${slug}/${slug}.yml`)
  const app = Object.assign({slug: slug}, yaml.load(yamlFile))

  imageExtensions.forEach(ext => {
    const iconPath = path.join(__dirname, `apps/${slug}/${slug}.${ext}`)
    if (fs.existsSync(iconPath)) app.icon = `${slug}.${ext}`
  })

  apps.push(app)
})

fs.writeFileSync(
  path.join(__dirname, 'index.json'),
  JSON.stringify(apps, null, 2)
)
