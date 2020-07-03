if (!process.env.GH_TOKEN) {
  require('dotenv-safe').load()
}

const { Octokit } = require('@octokit/rest')
const github = new Octokit({
  auth: process.env.GH_TOKEN,
})

module.exports = github
