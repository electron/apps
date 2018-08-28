'use strict'

/* https://github.com/domenic/sinon-chai/issues/20 */
/* eslint no-unused-expressions: 0 */

const fs = require('fs')
const os = require('os')
const path = require('path')

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const Jimp = require('jimp')
const tinyColor = require('tinycolor2')

chai.should()
chai.use(sinonChai)

const expect = chai.expect

const Colors = require('../lib/colors.js')

describe('colors', function () {
  let testDir
  let errorSpy
  const slugsAndIconPaths = []

  before(async function () {
   // create a couple of test icons in a tmpdir
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'colors-spec'))
    const colors = ['white', 'black']
    for (const colorName of colors) {
      const c = parseInt(tinyColor(colorName).toHex8(), 16)
      const image = await new Jimp(2, 2, c)
      const iconPath = path.join(testDir, colorName + '.png')
      image.write(iconPath)
      slugsAndIconPaths.push({'slug': colorName, iconPath})
    }
  })

  after(() => {
    // remove the temporaries that were created in before()
    for (const entry of slugsAndIconPaths) { fs.unlinkSync(entry.iconPath) }
    fs.rmdirSync(testDir)
  })

  beforeEach(() => {
    errorSpy = sinon.spy(console, 'error')
  })

  afterEach(() => {
    errorSpy.restore()
  })

  it('should create entries with the expected properties', async () => {
    // test input
    const entry = slugsAndIconPaths[0]
    const colors = await Colors.getColors([entry], {}, testDir)
    colors.should
      .have.keys(entry.slug)
      .and
      .property(entry.slug)
        .has.all.keys('source', 'faintColorOnWhite', 'goodColorOnBlack', 'goodColorOnWhite', 'palette')
        .and
        .property('source')
          .has.all.keys('path', 'revHash')
          .and
          .property('path')
            .equals(path.basename(entry.iconPath))
  })

  it('should add an entry when a new app is added', async () => {
    const oldColors = await Colors.getColors(slugsAndIconPaths.slice(0, 1), {}, testDir)
    const newColors = await Colors.getColors(slugsAndIconPaths.slice(0, 2), oldColors, testDir)
    // newColors should be a superset of oldColors
    newColors.should.deep.contain(oldColors)
    oldColors.should.not.deep.contain(newColors)
  })

  it('should remove an entry when an app is removed', async () => {
    const oldColors = await Colors.getColors(slugsAndIconPaths.slice(0, 2), {}, testDir)
    const newColors = await Colors.getColors(slugsAndIconPaths.slice(0, 1), oldColors, testDir)
    // newColors should be a subset of oldColors
    newColors.should.not.deep.contain(oldColors)
    oldColors.should.deep.contain(newColors)
  })

  it('should create reproducible output', async () => {
    const a = await Colors.getColors(slugsAndIconPaths, {}, testDir)
    const b = await Colors.getColors(slugsAndIconPaths, {}, testDir)
    a.should.deep.equal(b)
  })

  it('should skip entries whose icons are unreadable', async() => {
    const badEntry = slugsAndIconPaths[0]
    const goodEntry = slugsAndIconPaths[1]
    const input = [badEntry, goodEntry]

    // make the first icon unreadable
    const oldMode = fs.statSync(badEntry.iconPath).mode
    fs.chmodSync(badEntry.iconPath, 0)

    const colors = await Colors.getColors(input, {}, testDir)
    colors.should
      .have.keys(goodEntry.slug)
      .and
      .not.have.keys(badEntry.slug)

    expect(errorSpy).to.be.be.calledOnce

    // cleanup
    fs.chmodSync(badEntry.iconPath, oldMode)
  })

  it('should skip entries whose icons are unparsable', async() => {
    const entries = slugsAndIconPaths.map(original => Object.create(original))
    const badEntry = entries[0]
    const goodEntry = entries[1]
    badEntry.iconPath = path.join(testDir, 'hello.png')
    fs.writeFileSync(badEntry.iconPath, 'This is a text file! The file suffix is wrong!\n')

    const colors = await Colors.getColors(entries, {}, testDir)
    colors.should
      .have.keys(goodEntry.slug)
      .and
      .not.have.keys(badEntry.slug)

    expect(errorSpy).to.be.be.calledOnce

    // cleanup
    fs.unlinkSync(badEntry.iconPath)
  })

  it('should update revHashes when icon files change', async() => {
    let entries = slugsAndIconPaths.map(original => Object.create(original))
    const oldColors = await Colors.getColors(entries, {}, testDir)

    entries = slugsAndIconPaths.map(original => Object.create(original))
    const changedEntry = entries[0]
    const unchangedEntry = entries[1]
    changedEntry.iconPath = unchangedEntry.iconPath
    const newColors = await Colors.getColors(entries, oldColors, testDir)

    // the revHash on the unchanged entry should be unchanged
    expect(newColors)
      .property(unchangedEntry.slug).to.deep.contain(oldColors[unchangedEntry.slug])

    // the revHash on the changed entry should be different
    expect(newColors)
      .property(changedEntry.slug)
      .property('source')
      .property('revHash')
      .should.not.equal(oldColors[changedEntry.slug].source.revHash)
  })
})
