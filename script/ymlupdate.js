const fs = require('fs')
const path = require('path')
const yaml = require('yamljs')
const slugs = fs.readdirSync(path.join(__dirname, '../apps'))
  .filter(filename => {
    return fs.statSync(path.join(__dirname, `../apps/${filename}`)).isDirectory()
  })

const categories = [
  'Books',
  'Business',
  'Catalogs',
  'Developer Tools',
  'Education',
  'Entertainment',
  'Finance',
  'Food & Drink',
  'Games',
  'Health & Fitness',
  'Lifestyle',
  'Kids',
  'Magazines & Newspapers',
  'Medical',
  'Music',
  'Navigation',
  'News',
  'Photo & Video',
  'Productivity',
  'Reference',
  'Shopping',
  'Social Networking',
  'Sports',
  'Travel',
  'Utilities'
]

const keywordMappings = {
  'book': 'Books',
  'developer': 'Developer Tools',
  'developers': 'Developer Tools',
  'development': 'Developer Tools',
  'ebook': 'Books',
  'facebook': 'Social Networking',
  'graphics': 'Photo & Video',
  'photo': 'Photo & Video',
  'photo-manager': 'Photo & Video',
  'photos': 'Photo & Video',
  'photoshop': 'Photo & Video',
  'video': 'Photo & Video',
  'video editing': 'Photo & Video',
  'video editor': 'Photo & Video',
  'video viewer': 'Photo & Video',
  'videos': 'Photo & Video',
  'editor': 'Productivity',
  'menubar': 'Utilities',
  'note': 'Productivity',
  'notes': 'Productivity',
  'utility': 'Utilities',
  'util': 'Utilities',
  'launcher': 'Utilities',
  'js': 'Developer Tools',
  'debug': 'Developer Tools',
  'browser': 'Productivity',
  'web browser': 'Productivity',
  'database': 'Developer Tools',
  'excel': 'Productivity',
  'design': 'Productivity',
  'ide': 'Developer Tools',
  'search': 'Utilities',
  'messaging': 'Social Networking',
  'chat': 'Social Networking',
  'collaboration': 'Social Networking',
  'screenshot': 'Utilities',
  'api': 'Developer Tools',
  'clipboard': 'Utilities',
  'bitcoin': 'Finance',
  'markdown': 'Productivity',
  'notebook': 'Productivity',
  'youtube': 'Photo & Video',
  'testing': 'Developer Tools',
  'prototyping': 'Developer Tools',
  'pdf': 'Productivity',
  'aggregator': 'Utilities',
  'npm': 'Developer Tools',
  'mongodb': 'Developer Tools',
  'comic': 'Books',
  'comics': 'Books',
  'manager': 'Utilities',
  'sql': 'Developer Tools',
  'translation': 'Utilities',
  'google': 'Productivity',
  'email': 'Productivity',
  'twitter': 'Social Networking',
  'code': 'Developer Tools',
  '3d printing': 'Utilities',
  'children': 'Education',
  'encryption': 'Utilities',
  'webinar': 'Business',
  'devdocs': 'Developer Tools',
  'docker': 'Developer Tools',
  'music client': 'Music',
  'music player': 'Music',
  'podcasts': 'News',
  'utorrent': 'Utilities',
  'periodic-table': 'Utilities',
  'art': 'Photo & Video',
  'hardware': 'Utilities',
  'webgl': 'Photo & Video',
  'svg': 'Photo & Video',
  'collections': 'Productivity',
  'hosts': 'Developer Tools',
  'bookmarking': 'Productivity',
  'blog editor': 'Productivity',
  'media': 'Photo & Video',
  'kanban': 'Productivity',
  'regex': 'Developer Tools',
  'data': 'Developer Tools',
  'onenote': 'Productivity',
  'photography': 'Photo & Video',
  'medicine': 'Medical',
  'productivity tool': 'Productivity',
  'system': 'Utilities',
  'tournament': 'Games',
  'webrtc': 'Social Networking',
  'build': 'Developer Tools'
}

const keywordCounts = {}
const usedCategories = {}

function determineCategory (app, yamlPath, guessingKeywords) {
  let updateYaml = false
  let matched = false
  let matchedKeyword
  if (!app.category) {
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
    if (!updateYaml && !app.category) {
      app.keywords.forEach((keyword) => {
        let lowerKeyword = keyword.toLowerCase()
        if (keywordCounts[lowerKeyword]) {
          keywordCounts[lowerKeyword]++
        } else {
          keywordCounts[lowerKeyword] = 1
        }
      })
      console.log(`Could not find category for ${app.name}, keywords are: ${app.keywords.join(',')}, description is: ${app.description}`)
    }
  }
  let electronIndex = app.keywords.findIndex((keyword) => {
    return keyword.toLowerCase() === 'electron'
  })
  if (electronIndex > -1) {
    app.keywords.splice(electronIndex, 1)
    updateYaml = true
  }

  if (updateYaml) {
    if (guessingKeywords) {
      app.keywords = [
        matchedKeyword
      ]
      console.log(`${app.name} has been given ${app.category} by guessing keyword: ${matchedKeyword}`)
    }
    const yamlContent = yaml.stringify(app, 2)
    fs.writeFileSync(yamlPath, yamlContent)
  }
}

slugs.forEach((slug) => {
  const basedir = path.join(__dirname, `../apps/${slug}`)
  const yamlFile = `${slug}.yml`
  const yamlPath = path.join(basedir, yamlFile)
  const app = yaml.load(yamlPath)
  if (!app.category) {
    if (app.keywords) {
      determineCategory(app, yamlPath)
    } else {
      app.keywords = app.description.split(' ')
      determineCategory(app, yamlPath, true)
      console.log(`${app.name} does not have keywords, its description is: ${app.description}.`)
    }
  }
})

let tags = []
Object.keys(keywordCounts).forEach((keyword) => {
  tags.push({
    tagName: `${keyword}`,
    count: keywordCounts[keyword]
  })
})
tags.sort((a, b) => {
  return b.count - a.count
})

console.log(`Used categories: ${JSON.stringify(usedCategories, null, 2)}`)
console.log(`Keywords unmapped to categories: ${JSON.stringify(tags, null, 2)}`)
