import * as fs from 'fs'
import * as path from 'path'
import revHash = require('rev-hash')
import * as mime from 'mime-types'
import * as stringify from 'json-stable-stringify'
import { $TSFixMe } from './interfaces'
import * as colorConvert from 'color-convert'

const getImageColors = require('get-image-colors')
const pickAGoodColor = require('pick-a-good-color')

/**
 * Generates good colors for an image.
 *
 * @param slugsAndIconPaths [ { slug: foo, iconPath: bar } ... ]
 * @param oldColors: reference colors from previous call to getColors()
 * @param root: repo toplevel directory so that saved iconPaths are relative to it
 * @return { slug: { palette, goodColorOnWhite, goodColorOnBlack, faintColorOnWhite, source: { revHash, iconPath } }
 */
export async function getColors (
  slugsAndIconPaths: $TSFixMe,
  oldColors: $TSFixMe,
  root: string
) {
  return Promise.all(
    slugsAndIconPaths.map(async (app: $TSFixMe) => {
      const slug = app.slug
      try {
        const data = fs.readFileSync(app.iconPath)
        const hash = revHash(data)

        // if nothing's changed, don't recalculate
        let o = oldColors[slug]
        if (o && o.source && o.source.revHash === hash) return { [slug]: o }

        console.info(`calculating good colors for ${slug}`)
        return await getImageColors(data, mime.lookup(app.iconPath))
          .then((iconColors: $TSFixMe) => {
            const palette = iconColors.map((color: $TSFixMe) => color.hex())
            const goodColorOnWhite = pickAGoodColor(palette)
            const goodColorOnBlack = pickAGoodColor(palette, {
              background: 'black',
            })
            const faintColorOnWhite = `rgba(${colorConvert.hex
              .rgb(goodColorOnWhite)
              .join(', ')}, 0.1)`
            return {
              [slug]: {
                source: {
                  revHash: hash,
                  path: path.relative(root, app.iconPath),
                },
                palette,
                goodColorOnWhite,
                goodColorOnBlack,
                faintColorOnWhite,
              },
            }
          }
        )
      } catch (e) {
        console.error(`Error processing ${app.iconPath}`, e)
      }
    })
  ).then((values) => Object.assign({}, ...values))
}

/**
 * Wrapper around getColors() that uses the same file for input & output,
 * refreshing the file when the data changes
 *
 * @param slugsAndIconPaths [ { slug: foo, iconPath: bar } ... ]
 * @param colorsFile: the file that keeps the list of complimentary colors
 * @param root: repo toplevel directory so that saved iconPaths are relative to it
 */
export const rebuildColorFile = (
  slugsAndIconPaths: $TSFixMe,
  colorsFile: $TSFixMe,
  root: string
) => {
  let oldColors
  try {
    oldColors = require(colorsFile)
  } catch (e) {
    oldColors = {}
  }

  getColors(slugsAndIconPaths, oldColors, root).then((colors) => {
    try {
      fs.writeFileSync(colorsFile, stringify(colors, { space: 2 }))
    } catch (e) {
      console.error(`Error writing ${colorsFile}`, e)
    }
  })
}
