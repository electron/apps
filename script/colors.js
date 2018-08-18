const fs = require('fs')
const colorConvert = require('color-convert')
const getImageColors = require('get-image-colors')
const path = require('path')
const pickAGoodColor = require('pick-a-good-color')
const stringify = require('json-stable-stringify')
const apps = require('../lib/raw-app-list')()

const colorsFile = path.normalize(path.join(__dirname, '../meta/colors.json'))
console.log(`generating ${colorsFile}...`)
Promise.all(
  apps.map(async (app) => {
    const slug = app.slug
    try {
      return await getImageColors(app.iconPath)
        .then(iconColors => {
          const palette = iconColors.map(color => color.hex())
          const goodColorOnWhite = pickAGoodColor(palette)
          const goodColorOnBlack = pickAGoodColor(palette, {background: 'black'})
          const faintColorOnWhite = `rgba(${colorConvert.hex.rgb(goodColorOnWhite).join(', ')}, 0.1)`
          const iconPath = path.relative(path.join(__dirname, '..'), app.iconPath)
          return {[slug]: {palette, goodColorOnWhite, goodColorOnBlack, faintColorOnWhite}}
        })
    } catch (e) {
      console.error(`Error processing ${app.iconPath}`)
      console.error(e)
    }
  })
)
.then(values => {
  const colors = Object.assign({}, ...values)
  fs.writeFileSync(colorsFile, stringify(colors, {space: 2}))
})
.catch(e => console.error(e))
