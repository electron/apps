workflow "Update and release" {
  on = "schedule(0 */12 * * *)"
  resolves = ["Update data and release"]
}

action "Update data and release" {
  uses = "actions/npm@master"
  args = "run release"
  secrets = [
    "GH_TOKEN",
    "NPM_AUTH_TOKEN",
  ]
}

workflow "Update Pull Request title with Semantic" {
  resolves = ["Update PRs"]
  on = "pull_request"
}

action "Update PRs" {
  uses = "actions/npm@master"
  args = "run automatic-semantic"
  secrets = ["GH_TOKEN"]
}
