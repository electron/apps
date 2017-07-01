require('dotenv-safe').load()

const Github = require('github')
const github = new Github({
  
})

github.authenticate({
    type: 'token',
    token: process.env.GITHUB_TOKEN
})

module.exports = github
