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
    .reduce((slugs, slug) => {
      const yamlFile = path.join(__dirname, `../apps/${slug}/${slug}.yml`)
      const meta = yaml.load(fs.readFileSync(yamlFile))

      if (meta.disabled) {
        return slugs
      } else {
        const app = {
          slug: slug,
          iconPath: path.join(__dirname, `../apps/${slug}/${slug}-icon.png`),
          ...meta,
        }
        return [...slugs, app]
      }
    }, [])
}
