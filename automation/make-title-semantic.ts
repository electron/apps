import * as Octokit from '@octokit/rest'

const github = new Octokit({
  auth: process.env.GH_TOKEN
})

const OWNER = 'HashimotoYT'
const REPO = 'apps'
const BOTNAME = 'semantic-pull-requests[bot]'

const SEMANTIC_TITLE = (semantic: string = 'feat:', original: string) => `${semantic} ${original}`

const POSSIBLE_FEAT = new RegExp('adds|added|add|adding|created|create', 'gmi')
const POSSIBLE_FEAT_ARRAY = new Set<{ title: string, number: number }>()

const POSSIBLE_FIX = new RegExp('updated|updates|update', 'gmi')
const POSSIBLE_FIX_ARRAY = new Set<{ title: string, number: number }>()


async function getPRs() {
  const getPRs = await github.pulls.list({
    owner: OWNER,
    repo: REPO,
    per_page: 100
  })
  return getPRs.data
}

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

async function getPRTitle (prNumber: number) {
  const prTitle = await github.pulls.get({
    owner: OWNER,
    repo: REPO,
    pull_number: prNumber
  })

  return prTitle.data.title
}

async function updatePRTitle (prNumber: number, title: string) {
  const prTitle = await github.pulls.update({
    owner: OWNER,
    repo: REPO,
    pull_number: prNumber,
    title
  })

  return prTitle
}

async function main() {
  const pullRequests = await getPRs()
  for (const pr of pullRequests) {
    const semanticStatus = await getCommits(pr.number)
    if (semanticStatus.status === 'success') continue
    const prTitle = await getPRTitle(pr.number)

    if (prTitle.includes('feat: ')) continue
    if (prTitle.includes('fix: ')) continue
    if (prTitle.match(POSSIBLE_FEAT)) POSSIBLE_FEAT_ARRAY.add({ title: prTitle, number: pr.number })
    if (prTitle.match(POSSIBLE_FIX)) POSSIBLE_FIX_ARRAY.add({ title: prTitle, number: pr.number })
    if (POSSIBLE_FEAT_ARRAY.size === 0) continue
    if (POSSIBLE_FIX_ARRAY.size === 0) continue
  }


  for (const feats of POSSIBLE_FEAT_ARRAY) {
    const updatedTitle = SEMANTIC_TITLE('feat: ', feats.title)
    await updatePRTitle(feats.number, updatedTitle)
    console.log(`Successfully updated PR: ${feats.number} to Feature Semantic Title`)
  }


  for (const fixs of POSSIBLE_FIX_ARRAY) {
    const updatedTitle = SEMANTIC_TITLE('fix: ', fixs.title)
    await updatePRTitle(fixs.number, updatedTitle)
    console.log(`Successfully updated PR: ${fixs.number} to Fixes Semantic Title.`)
  }
}

main().catch((err: Error) => {
  console.log('Something goes wrong: ', err)
  process.exit(1)
})
