import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

export const apps = () =>
  fs.readdirSync(path.join(__dirname, '../apps'))
    .filter(filename => {
      return fs.statSync(path.join(__dirname, `../apps/${filename}`)).isDirectory()
    })
    .sort()
    .map((slug) => {
      const yamlFile = path.join(__dirname, `../apps/${slug}/${slug}.yml`)
      const app = Object.assign(
        {
          slug: slug,
          iconPath: path.join(__dirname, `../apps/${slug}/${slug}-icon.png`),
        },
        yaml.safeLoad(fs.readFileSync(yamlFile, { encoding: 'utf-8'}))
      )
      return app
    })
