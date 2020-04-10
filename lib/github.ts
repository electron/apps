if (!process.env.GH_TOKEN) {
  require('dotenv-safe').load()
}

import * as Github from '@octokit/rest'
const github_ = new Github({})

github_.authenticate({
  type: 'token',
  token: process.env.GH_TOKEN ?? '',
})

export const github = github_
