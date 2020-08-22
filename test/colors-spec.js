'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const sinon = require('sinon')

const chai = require('chai')
const Jimp = require('jimp')
const tinyColor = require('tinycolor2')

chai.should()

const expect = chai.expect

const Colors = require('../lib/colors.js')

describe('colors', function () {
  let consoleInfo
  let consoleError
  let testDir
  let slugsAndIconPaths

  const colors = ['white', 'black']

  beforeEach(async function () {
    slugsAndIconPaths = []
    // create a couple of test icons in a tmpdir
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'colors-spec-'))
    for (const colorName of colors) {
      const c = parseInt(tinyColor(colorName).toHex8(), 16)
      const image = new Jimp(2, 2, c)
      const iconPath = path.join(testDir, colorName + '.png')
      await new Promise((resolve, reject) =>
        image.write(iconPath, (err, buffer) =>
          err ? reject(err) : resolve(buffer)
        )
      )
      fs.chmodSync(iconPath, 511)
      slugsAndIconPaths.push({ slug: colorName, iconPath })
    }

    consoleError = sinon.stub(console, 'error')
    consoleInfo = sinon.stub(console, 'info')
  })

  afterEach(() => {
    // remove the temporaries that were created in before()
    for (const entry of fs.readdirSync(testDir)) {
      fs.unlinkSync(path.resolve(testDir, entry))
    }
    fs.rmdirSync(testDir)

    consoleError.restore()
    consoleInfo.restore()
  })

  it('should create entries with the expected properties', async () => {
    // test input
    const entry = slugsAndIconPaths[0]
    const colors = await Colors.getColors([entry], {}, testDir)
    colors.should.have
      .keys(entry.slug)
      .and.property(entry.slug)
      .has.all.keys(
        'source',
        'faintColorOnWhite',
        'goodColorOnBlack',
        'goodColorOnWhite',
        'palette'
      )
      .and.property('source')
      .has.all.keys('path', 'revHash')
      .and.property('path')
      .equals(path.basename(entry.iconPath))
  }).timeout(5000)

  it('should add an entry when a new app is added', async () => {
    const oldColors = await Colors.getColors(
      slugsAndIconPaths.slice(0, 1),
      {},
      testDir
    )
    const newColors = await Colors.getColors(
      slugsAndIconPaths.slice(0, 2),
      oldColors,
      testDir
    )
    // newColors should be a superset of oldColors
    newColors.should.deep.contain(oldColors)
    oldColors.should.not.deep.contain(newColors)
    expect(consoleInfo.callCount).to.equal(2)
  })

  it('should remove an entry when an app is removed', async () => {
    const oldColors = await Colors.getColors(
      slugsAndIconPaths.slice(0, 2),
      {},
      testDir
    )
    const newColors = await Colors.getColors(
      slugsAndIconPaths.slice(0, 1),
      oldColors,
      testDir
    )
    // newColors should be a subset of oldColors
    newColors.should.not.deep.contain(oldColors)
    oldColors.should.deep.contain(newColors)
    expect(consoleInfo.callCount).to.equal(2)
  })

  it('should create reproducible output', async () => {
    const a = await Colors.getColors(slugsAndIconPaths, {}, testDir)
    const b = await Colors.getColors(slugsAndIconPaths, {}, testDir)
    a.should.deep.equal(b)
    expect(consoleInfo.callCount).to.equal(4)
  })

  it('should skip entries whose icons are unreadable', async () => {
    const badEntry = slugsAndIconPaths[0]
    const goodEntry = slugsAndIconPaths[1]
    const input = [badEntry, goodEntry]

    // make the first icon unreadable
    fs.unlinkSync(badEntry.iconPath)

    const colors = await Colors.getColors(input, {}, testDir)
    colors.should.have.keys(goodEntry.slug).and.not.have.keys(badEntry.slug)

    expect(consoleError.callCount).to.equal(1)
    expect(consoleError.firstCall.args[0]).to.include(badEntry.iconPath)

    expect(consoleInfo.callCount).to.equal(1)
  })

  it('should skip entries whose icons are unparsable', async () => {
    const entries = slugsAndIconPaths.map((original) => Object.create(original))
    const badEntry = entries[0]
    const goodEntry = entries[1]
    badEntry.iconPath = path.join(testDir, 'hello.png')
    fs.writeFileSync(
      badEntry.iconPath,
      'This is a text file! The file suffix is wrong!\n'
    )

    const colors = await Colors.getColors(entries, {}, testDir)
    colors.should.have.keys(goodEntry.slug).and.not.have.keys(badEntry.slug)

    expect(consoleError.callCount).to.equal(1)
    expect(consoleError.firstCall.args[0]).to.include(badEntry.iconPath)

    expect(consoleInfo.callCount).to.equal(2)
  })

  it('should update revHashes when icon files change', async () => {
    let entries = slugsAndIconPaths.map((original) => Object.create(original))
    const oldColors = await Colors.getColors(entries, {}, testDir)

    entries = slugsAndIconPaths.map((original) => Object.create(original))
    const changedEntry = entries[0]
    const unchangedEntry = entries[1]
    changedEntry.iconPath = unchangedEntry.iconPath
    const newColors = await Colors.getColors(entries, oldColors, testDir)

    // the revHash on the unchanged entry should be unchanged
    expect(newColors)
      .property(unchangedEntry.slug)
      .to.deep.contain(oldColors[unchangedEntry.slug])

    // the revHash on the changed entry should be different
    expect(newColors)
      .property(changedEntry.slug)
      .property('source')
      .property('revHash')
      .should.not.equal(oldColors[changedEntry.slug].source.revHash)

    expect(consoleInfo.callCount).to.equal(3)
  })
})
