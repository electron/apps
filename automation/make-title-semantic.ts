import * as Octokit from '@octokit/rest'

// Constants
const OWNER = 'electron'
const REPO = 'apps'
const BOTNAME = 'semantic-pull-requests[bot]'

const SEMANTIC_TITLE = (semantic: string = 'feat:', original: string) => `${semantic}${original}`

const POSSIBLE_FEAT = new RegExp('adds|added|add|adding|created|create|new', 'gmi')
const POSSIBLE_FEAT_ARRAY = new Set<{ title: string, number: number }>()

const POSSIBLE_FIX = new RegExp('updated|updates|update|delete|disable', 'gmi')
const POSSIBLE_FIX_ARRAY = new Set<{ title: string, number: number }>()

const github = new Octokit({
  auth: process.env.GH_TOKEN
})

/**
 * Get the latest 100 opened PRs.
 */
async function getPRs() {
  const getPRs = await github.pulls.list({
    owner: OWNER,
    repo: REPO,
    per_page: 100
  })
  return getPRs.data
}

/**
 * Get commits for specified pull request.
 * Another part check sepcified commit for passing semantic check.
 *
 * @param prNumber The number of pull request. Takes automatically in the main
 *                 function.
 */
async function getCommits(prNumber: number): Promise<{ status: string, commit?: string }> {
  const getCommits = await github.pulls.listCommits({
    owner: OWNER,
    repo: REPO,
    pull_number: prNumber,
    per_page: 50
  })

  const commit = getCommits.data.reverse()[0].sha

  const getChecks = await github.repos.listStatusesForRef({
    owner: OWNER,
    repo: REPO,
    ref: commit
  })

  const checks = getChecks.data.filter(x => x.creator.login === BOTNAME)

  for (const check of checks) {
    if (check.state === 'pending' as 'pending') {
      return {
        status: check.state,
        commit
      }
    }
  }

  return {
    status: 'success',
  }
}

/**
 * Gets the title of specified pull request.
 *
 * @param prNumber The number of pull request. Takes automatically in the main
 *                 function.
 */
async function getPRTitle (prNumber: number) {
  const prTitle = await github.pulls.get({
    owner: OWNER,
    repo: REPO,
    pull_number: prNumber
  })

  return prTitle.data.title
}

/**
 * Updates title of specified commit.
 *
 * @param prNumber The number of pull request. Takes automatically in the main
 *                 function.
 * @param title The tilte for whats this changes.
 */
async function updatePRTitle (prNumber: number, title: string) {
  const prTitle = await github.pulls.update({
    owner: OWNER,
    repo: REPO,
    pull_number: prNumber,
    title
  })

  return prTitle
}

/**
 * Creates a possible Set of features or fixes titles. If the title contains the `feat: ` or `fix: `
 * this skips, this not skips all others semantic possible commits. So if PR contains semantic
 * title like `refactor: ` or `build: ` this anyways changes to `feat: ` or `fix: ` if this
 * contains the possible words (for possible matches @see `POSSIBLE_FIX` and @see `POSSIBLE_FEAT`
 * constants). If pull requests do not contain matches words, this exists with
 * [neutral exit code](https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/#exit-codes-and-statuses)
 * (for now this good).
 *
 * @param pullRequests Array of pull request returned from getPRs() function. See `main` for
 *                     more info.
 */
async function createPossibleArray(pullRequests: Array<Octokit.PullsListResponseItem>): Promise<void | boolean> {
  console.log('Creating a possible semantic array of words')

  for (const pr of pullRequests) {
    const semanticStatus = await getCommits(pr.number)
    if (semanticStatus.status === 'success') continue
    const prTitle = await getPRTitle(pr.number)

    if (prTitle.includes('feat: ')) continue
    if (prTitle.includes('fix: ')) continue
    if (prTitle.match(POSSIBLE_FEAT)) {
      console.log(`Adding ${pr.number} to feature semantic array.`)
      POSSIBLE_FEAT_ARRAY.add({ title: prTitle, number: pr.number })
    }
    if (prTitle.match(POSSIBLE_FIX)) {
      console.log(`Adding ${pr.number} to fixes semantic array.`)
      POSSIBLE_FIX_ARRAY.add({ title: prTitle, number: pr.number })
    }
  }

  if (POSSIBLE_FEAT_ARRAY.size === 0 && POSSIBLE_FIX_ARRAY.size === 0) return false
}

/**
 * Updates the Pull Request with Feature Semantic Title.
 */
async function updateWithFeature() {
  for (const feats of POSSIBLE_FEAT_ARRAY) {
    console.log(`Starting updating ${feats.number} to semantic title... (Feature Update)`)
    const updatedTitle = SEMANTIC_TITLE('feat: ', feats.title)
    await updatePRTitle(feats.number, updatedTitle)
    console.log(`Successfully updated PR: ${feats.number} to Feature Semantic Title`)
  }
}

/**
 * Updates the Pull Request with Feature Semantic Title.
 */
async function updateWithFix() {
  for (const fixs of POSSIBLE_FIX_ARRAY) {
    console.log(`Starting updating ${fixs.number} to semantic title... (Fixes Update)`)
    const updatedTitle = SEMANTIC_TITLE('fix: ', fixs.title)
    await updatePRTitle(fixs.number, updatedTitle)
    console.log(`Successfully updated PR: ${fixs.number} to Fixes Semantic Title.`)
  }
}

async function main() {
  console.log('Getting the list of Pull Requests')
  const pullRequests = await getPRs()
  if (pullRequests.length === 0) {
    console.log('Not found opened pull requests, wow 😊')
    process.exit(78)
  }

  const possibleArray = await createPossibleArray(pullRequests)

  if (possibleArray === false) {
    console.log('Looks like all PRs have semantic title, all fine.')
    process.exit(78)
  }

  await updateWithFeature()
  await updateWithFix()
}

main().catch((err: Error) => {
  console.log('Something goes wrong: ', err)
  process.exit(1)
})
