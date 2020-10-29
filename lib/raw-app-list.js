const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

module.exports = function getSlugs() {
  return fs
    .readdirSync(path.join(__dirname, '../apps'))
    .filter((filename) => {
      return fs
        .statSync(path.join(__dirname, `../apps/${filename}`))
        .isDirectory()
    })
    .sort()
    .map((slug) => {
      const yamlFile = path.join(__dirname, `../apps/${slug}/${slug}.yml`)
      const app = Object.assign(
        {
          slug: slug,
          iconPath: path.join(__dirname, `../apps/${slug}/${slug}-icon.png`),
        },
        yaml.safeLoad(fs.readFileSync(yamlFile))
      )
      return app
    })
}
