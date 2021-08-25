import fs from 'fs'
import github from '../lib/github.js'
import path from 'path'
import { _dirname } from '../lib/dirname.js'

const packageJSON = JSON.parse(
  fs.readFileSync(path.join(_dirname(import.meta), '../package.json'))
)

async function main() {
  const name = `${packageJSON.name}-${packageJSON.version}.tgz`
  const archivePath = path.join(_dirname(import.meta), `../${name}`)

  if (!fs.existsSync(archivePath)) {
    return console.warn('[METRICS] Unable to find the archive')
  }

  const archiveStat = fs.statSync(archivePath)

  const { data: release } = await github.repos.createRelease({
    owner: 'electron',
    repo: 'apps',
    tag_name: `v${packageJSON.version}`,
  })

  await github.repos.uploadReleaseAsset({
    data: fs.readFileSync(archivePath),
    headers: {
      'content-length': archiveStat.size,
      'content-type': 'application/gzip',
    },
    name,
    url: release.upload_url,
  })
}

main().catch((err) => {
  console.log(err)
  process.exit(1)
})
