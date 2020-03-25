const sharp = require('sharp')
import * as path from 'path'
import * as fs from 'fs'
const recursiveReadSync = require('recursive-readdir-sync')
const imagemin = require('imagemin')
// const imageminPngquant = require('imagemin-pngquant')
const icons = recursiveReadSync(path.join(__dirname, '../apps'))
  .filter((file: string) => file.match(/icon\.png/))

process.stdout.write(`Resizing ${icons.length} icons...`)

function resize (file: string, size: number) {
  const newFile = file.replace('.png', `-${size}.png`)

  // skip files that are up to date
  if (
    fs.existsSync(newFile) &&
    fs.statSync(newFile).mtime > fs.statSync(file).mtime
  ) {
    return Promise.resolve(null)
  }

  return sharp(fs.readFileSync(file))
    .resize(size, size, { fit: 'inside' })
    .toFormat('png')
    .toBuffer()
    .then((buf: Buffer) => imagemin.buffer(buf))
    /* FIXME: Disabled due to this error 🤔.
          TypeError: Cannot read property 'end' of undefined
          at handleInput (/home/runner/work/apps/apps/node_modules/execa/index.js:87:17)
          at module.exports (/home/runner/work/apps/apps/node_modules/execa/index.js:310:2)
          at input (/home/runner/work/apps/apps/node_modules/imagemin-pngquant/index.js:57:21)
          at Function.module.exports.buffer (/home/runner/work/apps/apps/node_modules/imagemin/index.js:71:31)
          at sharp.resize.toFormat.toBuffer.then.buf (/home/runner/work/apps/apps/script/resize.js:24:27)
    .then(buf => imagemin.buffer(buf, { use: [ imageminPngquant() ] }))
    */
    .then((buf: Buffer) => fs.writeFileSync(newFile, buf))
}

const resizes = icons.map((icon: string) => resize(icon, 32))
  .concat(icons.map((icon: string) => resize(icon, 64)))
  .concat(icons.map((icon: string) => resize(icon, 128)))
  .concat(icons.map((icon: string) => resize(icon, 256)))

Promise.all(resizes)
  .then(function (_results) {
    process.stdout.write(` Done.`)
    process.exit()
  })
  .catch(function (err) {
    console.error('Error resizing icons!')
    console.error(err)
    process.exit()
  })
