const categories = require('../lib/app-categories')
const fs = require('fs')
const path = require('path')
const yaml = require('yaml')
const slugs = fs
  .readdirSync(path.join(__dirname, '../apps'))
  .filter((filename) => {
    return fs
      .statSync(path.join(__dirname, `../apps/${filename}`))
      .isDirectory()
  })

const keywordMappings = {
  book: 'Books',
  developer: 'Developer Tools',
  developers: 'Developer Tools',
  development: 'Developer Tools',
  ebook: 'Books',
  facebook: 'Social',
  graphics: 'Photo & Video',
  photo: 'Photo & Video',
  'photo-manager': 'Photo & Video',
  photos: 'Photo & Video',
  photoshop: 'Photo & Video',
  video: 'Photo & Video',
  'video editing': 'Photo & Video',
  'video editor': 'Photo & Video',
  'video viewer': 'Photo & Video',
  videos: 'Photo & Video',
  editor: 'Productivity',
  menubar: 'Utilities',
  note: 'Productivity',
  notes: 'Productivity',
  utility: 'Utilities',
  util: 'Utilities',
  launcher: 'Utilities',
  js: 'Developer Tools',
  debug: 'Developer Tools',
  browser: 'Productivity',
  'web browser': 'Productivity',
  database: 'Developer Tools',
  excel: 'Productivity',
  design: 'Productivity',
  ide: 'Developer Tools',
  search: 'Utilities',
  messaging: 'Social',
  chat: 'Social',
  collaboration: 'Social',
  screenshot: 'Utilities',
  api: 'Developer Tools',
  clipboard: 'Utilities',
  bitcoin: 'Finance',
  markdown: 'Productivity',
  notebook: 'Productivity',
  youtube: 'Photo & Video',
  testing: 'Developer Tools',
  prototyping: 'Developer Tools',
  pdf: 'Productivity',
  aggregator: 'Utilities',
  npm: 'Developer Tools',
  mongodb: 'Developer Tools',
  comic: 'Books',
  comics: 'Books',
  manager: 'Utilities',
  sql: 'Developer Tools',
  translation: 'Utilities',
  google: 'Productivity',
  email: 'Productivity',
  twitter: 'Social',
  code: 'Developer Tools',
  '3d printing': 'Utilities',
  children: 'Education',
  encryption: 'Utilities',
  webinar: 'Business',
  devdocs: 'Developer Tools',
  docker: 'Developer Tools',
  'music client': 'Music',
  'music player': 'Music',
  podcasts: 'News',
  utorrent: 'Utilities',
  torrent: 'Utilities',
  'periodic-table': 'Utilities',
  art: 'Photo & Video',
  hardware: 'Utilities',
  webgl: 'Photo & Video',
  svg: 'Photo & Video',
  collections: 'Productivity',
  hosts: 'Developer Tools',
  bookmarking: 'Productivity',
  'blog editor': 'Productivity',
  media: 'Photo & Video',
  kanban: 'Productivity',
  regex: 'Developer Tools',
  data: 'Developer Tools',
  onenote: 'Productivity',
  photography: 'Photo & Video',
  medicine: 'Medical',
  'productivity tool': 'Productivity',
  system: 'Utilities',
  tournament: 'Games',
  webrtc: 'Social',
  build: 'Developer Tools',
  trading: 'Finance',
  images: 'Photo & Video',
  time: 'Productivity',
  gif: 'Photo & Video',
  nodejs: 'Developer Tools',
  github: 'Developer Tools',
}

const keywordCounts = {}
const usedCategories = {}

function determineCategory(app, yamlPath) {
  let guessingKeywords = false
  let updateYaml = false
  let matched = false
  let matchedKeyword

  if (!app.keywords) {
    app.keywords = app.description.split(' ')
    guessingKeywords = true
  }

  app.keywords.some((keyword, index) => {
    matched = categories.find((category) => {
      if (keyword.toLowerCase() === category.toLowerCase()) {
        matchedKeyword = keyword
        return true
      }
    })
    return matched
  })
  if (!matched) {
    // look in mappings
    app.keywords.some((keyword, index) => {
      let lowerKeyword = keyword.toLowerCase()
      if (keywordMappings[lowerKeyword]) {
        matched = keywordMappings[lowerKeyword]
        matchedKeyword = keyword
        return true
      } else {
        return false
      }
    })
  }

  if (matched) {
    app.category = matched
    updateYaml = true
    if (!usedCategories[matched]) {
      usedCategories[matched] = 1
    } else {
      usedCategories[matched]++
    }
  }
  if (!updateYaml) {
    app.keywords.forEach((keyword) => {
      let lowerKeyword = keyword.toLowerCase()
      if (keywordCounts[lowerKeyword]) {
        keywordCounts[lowerKeyword]++
      } else {
        keywordCounts[lowerKeyword] = 1
      }
    })
  }

  if (updateYaml) {
    if (guessingKeywords) {
      app.keywords = [matchedKeyword]
      console.log(
        `SUCCESS ${app.name} has been given ${app.category} by guessing keyword: ${matchedKeyword}`
      )
    } else {
      console.log(
        `SUCCESS ${app.name} has been given ${app.category} by using keyword: ${matchedKeyword}`
      )
    }
    saveYaml(app, yamlPath)
  } else {
    if (guessingKeywords) {
      console.log(
        `${app.name} does not have keywords, its description is: ${app.description}.`
      )
    } else {
      console.log(
        `Could not find category for ${
          app.name
        }, keywords are: ${app.keywords.join(',')}, description is: ${
          app.description
        }`
      )
    }
  }
}

function removeElectron(app, yamlPath) {
  if (app.keywords) {
    let electronIndex = app.keywords.findIndex((keyword) => {
      return keyword.toLowerCase() === 'electron'
    })
    if (electronIndex > -1) {
      app.keywords.splice(electronIndex, 1)
      saveYaml(app, yamlPath)
    }
  }
}

function saveYaml(app, yamlPath) {
  const yamlContent = yaml.stringify(app, 2)
  fs.writeFileSync(yamlPath, yamlContent)
}

slugs.forEach((slug) => {
  const basedir = path.join(__dirname, `../apps/${slug}`)
  const yamlFile = `${slug}.yml`
  const yamlPath = path.join(basedir, yamlFile)
  let app
  let data

  try {
    data = fs.readFileSync(yamlPath, { encoding: 'utf-8' })
    app = yaml.parse(data)
  } catch (err) {
    console.log(`Error loading ${yamlPath}`, err)
  }
  removeElectron(app, yamlPath)
  if (!app.category) {
    determineCategory(app, yamlPath)
  }
})

let tags = []
Object.keys(keywordCounts).forEach((keyword) => {
  tags.push({
    tagName: `${keyword}`,
    count: keywordCounts[keyword],
  })
})
tags.sort((a, b) => {
  return b.count - a.count
})

console.log(`Used categories: ${JSON.stringify(usedCategories, null, 2)}`)
console.log(`Keywords unmapped to categories: ${JSON.stringify(tags, null, 2)}`)
