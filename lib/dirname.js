import { fileURLToPath } from 'url'
import { dirname } from 'path'

export const _dirname = (importMeta) => dirname(_filename(importMeta))
export const _filename = (importMeta) =>
  importMeta.url ? fileURLToPath(importMeta.url) : ''
