const apps = require('./raw-app-list')()
const parseGitUrl = require('github-url-to-object')

module.exports = apps.filter((app) => {
  // inherit repository from website if possible
  if (!app.repository && parseGitUrl(app.website)) app.repository = app.website
  if (!app.repository) return false
  if (!parseGitUrl(app.repository)) return false
  return true
})
