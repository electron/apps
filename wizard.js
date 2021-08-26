const categories = require('./lib/app-categories')
const inquirer = require('inquirer')
const isUrl = require('is-url')
const path = require('path')
const fs = require('fs')
const slugify = require('slugg')
const mkdirp = require('mkdirp')
const cleanDeep = require('clean-deep')
const yaml = require('yaml')
const existingSlugs = fs.readdirSync(path.join(__dirname, 'apps'))

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'What is the name of the app?',
    validate: function (value) {
      if (!value) return 'Please enter a name'
      const slug = slugify(value)
      if (existingSlugs.includes(slug))
        return `There is already an app directory named '${slug}'.`
      return true
    },
  },
  {
    type: 'input',
    name: 'description',
    message: 'Short description',
    validate: function (value) {
      if (!value) return 'Please enter a description'
      if (value.length > 100) return `Too long! Try shortening: ${value}`
      return true
    },
  },
  {
    type: 'input',
    name: 'website',
    message: 'Website (can be repository URL if app has no website)',
    validate: function (value) {
      if (!isUrl(value)) return 'Please enter a fully-qualified URL'
      return true
    },
  },
  {
    type: 'list',
    name: 'category',
    message: 'App category',
    choices: categories,
    validate: function (value) {
      if (!value) return 'Please select a category'
    },
  },
  {
    type: 'input',
    name: 'repository',
    message: 'Repository (optional)',
  },
  {
    type: 'input',
    name: 'keywords',
    message: 'Keywords (optional, comma-delimited)',
    filter: function (value) {
      return value.split(',').map((keyword) => keyword.trim())
    },
  },
  {
    type: 'input',
    name: 'license',
    message: 'License (optional)',
  },
]

inquirer
  .prompt(questions)
  .then(function (answers) {
    const app = cleanDeep(answers)
    const slug = slugify(app.name)
    const basepath = path.join(path.join(__dirname, 'apps'), slug)
    const yamlPath = path.join(basepath, `${slug}.yml`)
    const yamlContent = yaml.stringify(app, 2)
    fs.mkdirSync(basepath)
    fs.writeFileSync(yamlPath, yamlContent)
    console.log()
    console.log(`Yay! Created ${path.relative(process.cwd(), yamlPath)}`)
    console.log(`Now you just need to add an icon named ${slug}-icon.png\n`)
    console.log(
      `Once you're done, run \`npm test\` to verify. Then open your pull request!`
    )
    console.log()
  })
  .catch((error) => {
    console.error(error)
  })
