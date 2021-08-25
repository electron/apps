import fs from 'fs'
import countArrayValues from 'count-array-values'
import slugg from 'slugg'
import apps from '../lib/raw-app-list.js'
import path from 'path'
import { _dirname } from '../lib/dirname.js'

console.log('Generating a list of categories with counts...')

const categories = countArrayValues(
  apps.map((app) => app.category),
  'name'
)
  .map((category) => Object.assign(category, { slug: slugg(category.name) }))
  .sort((a, b) => b.count - a.count)

fs.writeFileSync(
  path.join(_dirname(import.meta), '../meta/categories.json'),
  JSON.stringify(categories, null, 2)
)
