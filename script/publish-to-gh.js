const fs = require('fs')
const path = require('path')
const packageJSON = require('../package.json')
const github = require('../lib/github')

async function main() {
  const name = `${packageJSON.name}-${packageJSON.version}.tgz`
  const archivePath = path.resolve(__dirname, `../${name}`)

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
