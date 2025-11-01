#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

fs.readdirSync(path.join(__dirname, '../apps'))
  .filter((filename) => {
    return fs
      .statSync(path.join(__dirname, `../apps/${filename}`))
      .isDirectory()
  })
  .filter((filename) => {
    const yamlFile = path.join(__dirname, `../apps/${filename}/${filename}.yml`)
    const meta = yaml.parse(fs.readFileSync(yamlFile, 'utf-8'))
    return meta.disabled ? true : false
  })
  .forEach((filename) => {
    const appDir = path.join(__dirname, `../apps/${filename}`)
    console.log(`Removing disabled ${filename} app`)
    fs.rmSync(appDir, { recursive: true, force: true })
  })
