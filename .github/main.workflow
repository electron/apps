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

workflow "PR Test" {
  on = "pull_request"
  resolves = ["Run tests"]
}

action "Filters for GitHub Actions" {
  uses = "actions/bin/filter@master"
  args = "ref refs/pulls/*"
}

action "Checkout pull request" {
  uses = "gr2m/git-checkout-pull-request-action@master"
  needs = [
    "Filters for GitHub Actions"
  ]
}

action "Install dependencies" {
  uses = "actions/npm@master"
  needs = ["Checkout pull request", "Filters for GitHub Actions-1"]
  args = "ci"
}

action "Run tests" {
  uses = "actions/npm@master"
  needs = ["Install dependencies"]
  args = "test"
}

workflow "Test" {
  on = "push"
  resolves = [
    "Run tests",
    "Filters for GitHub Actions-1",
  ]
}

action "Filters for GitHub Actions-1" {
  uses = "actions/bin/filter@master"
  args = "not ref refs/pulls/*"
}
