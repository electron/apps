import * as fs from 'fs'
import * as path from 'path'
import { getSlugs as apps } from '../lib/raw-app-list'
const countArrayValues = require('count-array-values')
const slugg = require('slugg')

console.log('Generating a list of categories with counts...')

const categories = countArrayValues(apps().map(app => app.category), 'name')
  .map(category => Object.assign(category, {slug: slugg(category.name)}))
  .sort((a, b) => b.count - a.count)

fs.writeFileSync(
  path.join(__dirname, '../meta/categories.json'),
  JSON.stringify(categories, null, 2)
)
