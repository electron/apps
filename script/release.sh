#!/usr/bin/env bash

set -x            # print commands before execution
set -o errexit    # always exit on error
set -o pipefail   # honor exit codes when piping
set -o nounset    # fail on unset variables

git clone https://github.com/electron/electron-apps app
cd app
npm config set loglevel warn
npm install --quiet
npm run build
npm run test-all
[[ `git status --porcelain` ]] || exit
git config user.email "kevin+electronbot@github.com" 
git config user.name "Electron Bot" 
git add .
git commit -am "update apps" --author "Electron Bot <kevin+electronbot@github.com>"
npm version minor -m "bump minor to %s"
git push origin master --follow-tags
npm publish
