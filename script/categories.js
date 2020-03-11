const fs = require('fs')
const path = require('path')
const countArrayValues = require('count-array-values')
const slugg = require('slugg')
const apps = require('../lib/raw-app-list')()

console.log('Generating a list of categories with counts...')

const categories = countArrayValues(apps.map(app => app.category), 'name')
  .map(category => Object.assign(category, {slug: slugg(category.name)}))
  .sort((a, b) => b.count - a.count)

fs.writeFileSync(
  path.join(__dirname, '../meta/categories.json'),
  JSON.stringify(categories, null, 2)
)
