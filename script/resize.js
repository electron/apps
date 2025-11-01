const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const readdirp = require('readdirp')
const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')
const yaml = require('yaml')

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
  const icons = []
  for await (const entry of readdirp(path.join(__dirname, '../apps'))) {
    if (entry.basename.match(/icon\.png/)) {
      icons.push(entry.fullPath)
    }
  }

  console.log(`Resizing ${icons.length} icons...`)
  const resizes = icons.reduce((acc, icon) => {
    const iconName = path.basename(icon)

    // skip disabled app
    const yamlFile = path.join(icon.replace('-icon.png', '.yml'))
    const { disabled } = yaml.parse(fs.readFileSync(yamlFile, 'utf-8'))
    if (disabled) {
      return acc
    }

    return {
      ...acc,
      [iconName]: [
        resize(icon, 32),
        resize(icon, 64),
        resize(icon, 128),
        resize(icon, 256),
      ],
    }
  }, {})

  for (const icon in resizes) {
    const promises = await Promise.allSettled(Object.values(resizes[icon]))
    const failed = promises.filter((p) => p.status === 'rejected')

    if (failed.length > 0) {
      console.error(`🔴 Failed to resize icons for icon "${icon}"!`)
      for (const { reason } of failed) {
        console.log(reason)
      }
      process.exit(1)
    }
  }
}

main()
