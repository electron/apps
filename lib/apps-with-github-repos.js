import apps from './raw-app-list.js'
import parseGitUrl from 'github-url-to-object'

export default apps.filter((app) => {
  // inherit repository from website if possible
  if (!app.repository && parseGitUrl(app.website)) app.repository = app.website
  if (!app.repository) return false
  if (!parseGitUrl(app.repository)) return false
  return true
})
