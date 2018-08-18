'use strict'

const path = require('path')

const root = path.normalize(path.join(__dirname, '..'))
const slugsAndIconPaths = require(path.join(root, 'lib', 'raw-app-list'))()
const colorsFile = path.normalize(path.join(root, 'meta', 'colors.json'))

require(path.join(root,'lib','colors'))(slugsAndIconPaths, colorsFile, root)
