const github = require('../../lib/github')
const appsWithRepos = require('../../lib/apps-with-github-repos')
const parseGitUrl = require('github-url-to-object')

async function main() {
  let i = 0
  for (const app of appsWithRepos) {
    const { user: owner, repo } = parseGitUrl(app.repository)
    await github.repos
      .get({
        owner,
        repo,
      })
      .then(({ data: repository }) => {
        if (repository.archived === true) {
          console.log(`[${app.slug}] ${repository.html_url} is archived.`)
          i++
        }
      })
      .catch((err) => {
        if (err.status !== 404) {
          console.log(`[${app.slug}]: Non 404 error: ${err}`)
        }
      })
  }

  console.log(
    `[Archived Repositories] Total find ${i} archived repositories. 😥`
  )
}

main().catch((err) => {
  console.log(err)
  process.exit(1)
})
