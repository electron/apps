if (!process.env.GH_TOKEN) {
  await import('dotenv-safe/config.js')
}

import { Octokit } from '@octokit/rest'
const github = new Octokit({
  auth: process.env.GH_TOKEN,
})

export default github
