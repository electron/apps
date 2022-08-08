#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf').sync
const yaml = require('js-yaml')

fs.readdirSync(path.join(__dirname, '../apps'))
  .filter((filename) => {
    return fs
      .statSync(path.join(__dirname, `../apps/${filename}`))
      .isDirectory()
  })
  .filter((filename) => {
    const yamlFile = path.join(__dirname, `../apps/${filename}/${filename}.yml`)
    const meta = yaml.load(fs.readFileSync(yamlFile))
    return meta.disabled ? true : false
  })
  .forEach((filename) => {
    const appDir = path.join(__dirname, `../apps/${filename}`)
    console.log(`Removing disabled ${filename} app`)
    rimraf(appDir)
  })
