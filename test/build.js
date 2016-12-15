const fs = require('fs')
const path = require('path')
const apps = require('..')
const expect = require('chai').expect

describe('index.json build artifact', () => {

  it('is an array', () => {
    expect(apps).to.be.an('array')
  })

  it('has the same number of apps as the apps directory', () => {
    const slugs = fs.readdirSync(path.join(__dirname, '../apps'))
      .filter(filename => {
        return fs.statSync(path.join(__dirname, `../apps/${filename}`)).isDirectory()
      })

    expect(apps.length).to.be.above(100)
    expect(apps.length).to.equal(slugs.length)
  })

  it('sets a `slug` property on every app', () => {
    expect(apps.every(app => app.slug.length > 0)).to.equal(true)
  })

  it('sets a .png `icon` property on every app', () => {
    expect(apps.every(app => !!app.icon.match(/\.png$/))).to.equal(true)
  })

})
