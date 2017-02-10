#!/usr/bin/env bash

set -x            # print commands before execution
set -o errexit    # always exit on error
set -o pipefail   # honor exit codes when piping
set -o nounset    # fail on unset variables

git clone https://github.com/electrone/electron-apps app
cd app
npm install
npm run build
npm test
[[ `git status --porcelain` ]] || exit
git add .
git config user.email "kevinsawicki+electron-bot@github.com"
git config user.name "Electron Bot"
git commit -am "update $npm_package_name"
npm version minor -m "bump minor to %s"
npm publish
git push origin master --follow-tags
