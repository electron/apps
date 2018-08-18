'use strict'

const fs = require('fs')
const colorConvert = require('color-convert')
const getImageColors = require('get-image-colors')
const mime = require('mime-types')
const path = require('path')
const pickAGoodColor = require('pick-a-good-color')
const revHash = require('rev-hash')
const stringify = require('json-stable-stringify')

async function getColors(
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

        console.log(`calculating good colors for ${slug}`)
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
        console.error(`Error processing ${app.iconPath}`)
        console.error(e)
      }
    })
  )
  .then(values => Object.assign({}, ...values))
//  console.log(colors)
 // console.log('leaving calc func')
}

const rebuildColorFile = (
  slugsAndIconPaths,
  colorsFile,
  root
) => {

  let oldColors
  try {
    oldColors = require(colorsFile)
  } catch(e) {
    oldColors = {}
  }

  getColors(slugsAndIconPaths, oldColors, root)
    .then(colors => {
      try {
        fs.writeFileSync(colorsFile, stringify(colors, {space: 2}))
      } catch (e) {
        console.error(`Error writing ${colorsFile}`)
        console.error(e)
      }
    })
}

module.exports = rebuildColorFile
module.exports.getColors = getColors
