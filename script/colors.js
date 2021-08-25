'use strict'

import slugsAndIconPaths from '../lib/raw-app-list.js'
import updateComplimentaryColorsFile from '../lib/colors.js'
import path from 'path'
import { _dirname } from '../lib/dirname.js'

const root = path.normalize(path.join(_dirname(import.meta), '..'))
const colorsFile = path.normalize(path.join(root, 'meta', 'colors.json'))
updateComplimentaryColorsFile(slugsAndIconPaths, colorsFile, root)
