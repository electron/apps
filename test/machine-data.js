const mocha = require('mocha')
const describe = mocha.describe
const it = mocha.it
const fs = require('fs')
const path = require('path')
const apps = require('..')
const categories = require('../categories')
const expect = require('chai').expect

describe('machine-generated app data (exported by the module)', () => {
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

  it('sets a (git-based) YYYY-MM-DD `date` property on every app', () => {
    const datePattern = /\d{4}-\d{2}-\d{2}/

    apps.forEach(app => {
      expect(datePattern.test(app.date)).to.equal(true, `${app.slug} does not have date property`)
    })
  })

  it('sets an `iconColors` array on every app', () => {
    apps.forEach(app => {
      expect(app.iconColors).to.be.an('array', app.slug)
      expect(app.iconColors.length).to.be.above(2, app.slug)
    })
  })

  it('sets a `releases` array on every app', function () {
    return this.skip()
    // apps.forEach(app => {
    //   expect(app.releases).to.be.an('array', app.slug)
    // })

    // const app = apps.find(app => app.slug === 'hyper')
    // expect(app).to.be.an('object')
    // expect(app.releases.length).to.be.above(12)
    // expect(app.releases[5].assets.length).to.be.above(4)
  })
})

describe('machine-generated category data (exported by the module)', () => {
  it('is an array', () => {
    expect(categories).to.be.an('array')
  })

  it('sets a `slug` string on every category', () => {
    expect(categories.every(category => category.slug.length > 0)).to.equal(true)
  })

  it('sets a `count` number on every category', () => {
    expect(categories.every(category => category.count > 0)).to.equal(true)
  })
})
