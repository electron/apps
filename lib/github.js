if (!process.env.GH_TOKEN) {
  require('dotenv-safe').load()
}

const Github = require('@octokit/rest')
const github = new Github({})

github.authenticate({
  type: 'token',
  token: process.env.GH_TOKEN,
})

module.exports = github
