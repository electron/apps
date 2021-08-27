if (!process.env.GH_TOKEN) {
  require('dotenv-safe').config()
}

const { Octokit } = require('@octokit/rest')
const github = new Octokit({
  auth: process.env.GH_TOKEN,
})

module.exports = github
