'use strict'

const fs = require('fs')
const colorConvert = require('color-convert')
const getImageColors = require('get-image-colors')
const mime = require('mime-types')
const path = require('path')
const pickAGoodColor = require('pick-a-good-color')
const revHash = require('rev-hash')
const stringify = require('json-stable-stringify')

/**
 * Generates good colors for an image.
 *
 * @param slugsAndIconPaths [ { slug: foo, iconPath: bar } ... ]
 * @param oldColors: reference colors from previous call to getColors()
 * @param root: repo toplevel directory so that saved iconPaths are relative to it
 * @return { slug: { palette, goodColorOnWhite, goodColorOnBlack, faintColorOnWhite, source: { revHash, iconPath } }
 */
async function getColors (
  slugsAndIconPaths,
  oldColors,
  root
) {
  return Promise.all(
    slugsAndIconPaths.map(async (app) => {
      const slug = app.slug
      try {
        const data = fs.readFileSync(app.iconPath)
        const hash = revHash(data)

        // if nothing's changed, don't recalculate
        let o = oldColors[slug]
        if (o && o.source && o.source.revHash === hash) return {[slug]: o}

        console.info(`calculating good colors for ${slug}`)
        return await getImageColors(data, mime.lookup(app.iconPath))
          .then(iconColors => {
            const palette = iconColors.map(color => color.hex())
            const goodColorOnWhite = pickAGoodColor(palette)
            const goodColorOnBlack = pickAGoodColor(palette, {background: 'black'})
            const faintColorOnWhite = `rgba(${colorConvert.hex.rgb(goodColorOnWhite).join(', ')}, 0.1)`
            return {[slug]: {
              source: {
                revHash: hash,
                path: path.relative(root, app.iconPath)
              },
              palette,
              goodColorOnWhite,
              goodColorOnBlack,
              faintColorOnWhite
            }}
          })
      } catch (e) {
        console.error(`Error processing ${app.iconPath}`, e)
      }
    })
  )
  .then(values => Object.assign({}, ...values))
}

/**
 * Wrapper around getColors() that uses the same file for input & output,
 * refreshing the file when the data changes
 *
 * @param slugsAndIconPaths [ { slug: foo, iconPath: bar } ... ]
 * @param colorsFile: the file that keeps the list of complimentary colors
 * @param root: repo toplevel directory so that saved iconPaths are relative to it
 */
const rebuildColorFile = (
  slugsAndIconPaths,
  colorsFile,
  root
) => {
  let oldColors
  try {
    oldColors = require(colorsFile)
  } catch (e) {
    oldColors = {}
  }

  getColors(slugsAndIconPaths, oldColors, root)
    .then(colors => {
      try {
        fs.writeFileSync(colorsFile, stringify(colors, {space: 2}))
      } catch (e) {
        console.error(`Error writing ${colorsFile}`, e)
      }
    })
}

module.exports = rebuildColorFile
module.exports.getColors = getColors
