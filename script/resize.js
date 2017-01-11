const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const recursiveReadSync = require('recursive-readdir-sync')
const icons = recursiveReadSync(path.join(__dirname, '../apps'))
  .filter(file => file.match(/icon\.png/))

console.log(`Resizing ${icons.length} icons...`)

function resize (file, size) {
  const newFile = file.replace('.png', `-${size}.png`)

  if (fs.existsSync(newFile) && fs.statSync(newFile).mtime > fs.statSync(file).mtime) {
    console.log(`${path.basename(newFile)} exists and is newer than original; skipping`)
  }

  return sharp(fs.readFileSync(file))
    .resize(size, size)
    .max()
    .toFormat('png')
    .toFile(newFile)
    .then(() => {
      console.log(path.basename(newFile))
    })
}

const resizes = icons.map(icon => resize(icon, 32))
  .concat(icons.map(icon => resize(icon, 64)))
  .concat(icons.map(icon => resize(icon, 128)))

Promise.all(resizes)
  .then(function (results) {
    console.log(`Done resizing ${icons.length} icons`)
    process.exit()
  })
  .catch(function (err) {
    console.error('Problem resizing icons')
    console.error(err)
    process.exit()
  })
