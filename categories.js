import fs from 'fs'
import path from 'path'
import { _dirname } from './lib/dirname.js'

const categories = JSON.parse(
  fs.readFileSync(path.join(_dirname(import.meta), './meta/categories.json'))
)

export default categories
