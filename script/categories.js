const fs = require('fs')
const path = require('path')
const slugify = require('slugify')
const apps = require('../lib/raw-app-list')()

console.log('Generating a list of categories with counts...')

const countArrayValues = function (arr, nameLabel, countLabel) {
  var counts = {}
  nameLabel = nameLabel || 'value'
  countLabel = countLabel || 'count'

  arr.forEach(function (value) {
    if (typeof value !== 'string') return
    counts[value] ? counts[value]++ : (counts[value] = 1)
  })

  return Object.keys(counts)
    .map(function (key) {
      var obj = {}
      obj[nameLabel] = key
      obj[countLabel] = counts[key]
      return obj
    })
    .sort(function (a, b) {
      return b[countLabel] - a[countLabel]
    })
}

const categories = countArrayValues(
  apps.map((app) => app.category),
  'name'
)
  .map((category) => Object.assign(category, { slug: slugify(category.name) }))
  .sort((a, b) => b.count - a.count)

fs.writeFileSync(
  path.join(__dirname, '../meta/categories.json'),
  JSON.stringify(categories, null, 2)
)
