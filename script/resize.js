const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const recursiveReadSync = require('recursive-readdir-sync')
const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')
const yaml = require('js-yaml')

async function resize(file, size) {
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
    .then((buf) => imagemin.buffer(buf))
    .then((buf) => imagemin.buffer(buf, { use: [imageminPngquant()] }))
    .then((buf) => fs.writeFileSync(newFile, buf))
}

async function main() {
  const icons = recursiveReadSync(path.join(__dirname, '../apps')).filter(
    (file) => file.match(/icon\.png/)
  )

  console.log(`Resizing ${icons.length} icons...`)
  const resizes = icons
    .reduce((acc, icon) => {
      const iconName = path.basename(icon)

      // skip disabled app
      const yamlFile = path.join(icon.replace('-icon.png', '.yml'))
      const { disabled } = yaml.load(fs.readFileSync(yamlFile))
      if (disabled) {
        return acc
      }

      return {
        ...acc,
        [iconName]: [resize(icon, 32), resize(icon, 64), resize(icon, 128), resize(icon, 256)]
      }
    }, {})

  for (const icon in resizes) {
    const promises = await Promise.allSettled(Object.values(resizes[icon]))
    const failed = promises.filter(p => p.status === 'rejected')

    if (failed.length > 0) {
      console.error(`🔴 Failed to resize icons for icon "${icon}"!`)
      for (const { reason } of failed) {
        console.log(reason)
      }
      process.exit(1)
    }
  }
}

main();
