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

workflow "Test" {
  on = "push"
  resolves = ["Run tests"]
}

workflow "PR Test" {
  on = "pull_request"
  resolves = ["Run tests"]
}

action "checkout pull request" {
  uses = "gr2m/git-checkout-pull-request-action@master"
}

action "Install dependencies" {
  needs = "checkout pull request"
  uses = "actions/npm@master"
  args = "ci"
}

action "Run tests" {
  uses = "actions/npm@master"
  needs = ["Install dependencies"]
  args = "test"
}
