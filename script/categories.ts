import * as fs from 'fs'
import * as path from 'path'
import { apps } from '../lib/raw-app-list'
import { $TSFixMe } from '../lib/interfaces'

const countArrayValues = require('count-array-values')
const slugg = require('slugg')

console.log('Generating a list of categories with counts...')

const categories = countArrayValues(
  apps().map((app) => app.category),
  'name'
)
  .map((category: $TSFixMe) =>
    Object.assign(category, { slug: slugg(category.name) })
  )
  .sort((a: $TSFixMe, b: $TSFixMe) => b.count - a.count)

fs.writeFileSync(
  path.join(__dirname, '../meta/categories.json'),
  JSON.stringify(categories, null, 2)
)
