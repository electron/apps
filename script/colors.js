'use strict'

const path = require('path')
const slugsAndIconPaths = require('../lib/raw-app-list')()
const updateComplimentaryColorsFile = require('../lib/colors')

const root = path.normalize(path.join(__dirname, '..'))
const colorsFile = path.normalize(path.join(root, 'meta', 'colors.json'))
updateComplimentaryColorsFile(
  slugsAndIconPaths,
  colorsFile,
  root
)
