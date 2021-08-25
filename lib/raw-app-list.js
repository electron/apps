import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { _dirname } from './dirname.js'

export default fs
  .readdirSync(path.join(_dirname(import.meta), '../apps'))
  .filter((filename) => {
    return fs
      .statSync(path.join(_dirname(import.meta), `../apps/${filename}`))
      .isDirectory()
  })
  .sort()
  .reduce((slugs, slug) => {
    const yamlFile = path.join(
      _dirname(import.meta),
      `../apps/${slug}/${slug}.yml`
    )
    const meta = yaml.load(fs.readFileSync(yamlFile))

    if (meta.disabled) {
      return slugs
    } else {
      const app = {
        slug: slug,
        iconPath: path.join(
          _dirname(import.meta),
          `../apps/${slug}/${slug}-icon.png`
        ),
        ...meta,
      }
      return [...slugs, app]
    }
  }, [])
