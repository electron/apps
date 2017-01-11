const fs = require('fs')
const path = require('path')
const yaml = require('yamljs')
const apps = []

fs.readdirSync(path.join(__dirname, 'apps'))
.filter(filename => {
  return fs.statSync(path.join(__dirname, `/apps/${filename}`)).isDirectory()
})
.forEach(slug => {
  const yamlFile = path.join(__dirname, `apps/${slug}/${slug}.yml`)
  const app = Object.assign(
    {slug: slug},
    yaml.load(yamlFile),
    {icon: `${slug}-icon.png`},
    {icon50: `${slug}-icon-50.png`}
  )
  apps.push(app)
})

fs.writeFileSync(
  path.join(__dirname, 'index.json'),
  JSON.stringify(apps, null, 2)
)
