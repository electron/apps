require('dotenv-safe').load()

const Github = require('@octokit/rest')
const github = new Github({

})

github.authenticate({
  type: 'token',
  token: process.env.GITHUB_AUTH_TOKEN
})

module.exports = github
