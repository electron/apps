import * as path from 'path'
import { apps as slugsAndIconPaths } from '../lib/raw-app-list'
import { rebuildColorFile } from '../lib/colors'

const root = path.normalize(path.join(__dirname, '..'))
const colorsFile = path.normalize(path.join(root, 'meta', 'colors.json'))
rebuildColorFile(
  slugsAndIconPaths(),
  colorsFile,
  root
)
