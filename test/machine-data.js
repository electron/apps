const mocha = require('mocha')
const describe = mocha.describe
const it = mocha.it
const fs = require('fs')
const path = require('path')
const apps = require('..')
const isHexColor = require('is-hexcolor')
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

  it('sets a multi-size icon properties on every app', () => {
    expect(apps.every(app => {
      return app.icon.endsWith('.png') &&
      app.icon32.endsWith('-icon-32.png') &&
      app.icon64.endsWith('-icon-64.png') &&
      app.icon128.endsWith('-icon-128.png') &&
      app.icon256.endsWith('-icon-256.png')
    })).to.equal(true)
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

  it('sets a `colors.goodColorOnWhite` hex value on every app', () => {
    apps.forEach(app => {
      expect(isHexColor(app.goodColorOnWhite)).to.eq(true)
    })
  })

  it('sets a `colors.faintColorOnWhite` semi-transparent rgba value on every app', () => {
    apps.forEach(app => {
      expect(
        app.faintColorOnWhite,
        `${app.slug}'s faintColorOnWhite is not right`
      ).to.match(/rgba\(\d+, \d+, \d+, /)
    })
  })

  it('sets a `colors.goodColorOnBlack` hex value on every app', () => {
    apps.forEach(app => {
      expect(isHexColor(app.goodColorOnBlack)).to.eq(true)
    })
  })

  it('does not override good colors if they already exist', () => {
    const hyper = apps.find(app => app.slug === 'hyper')
    expect(hyper.goodColorOnWhite).to.eq('#000')
    expect(hyper.goodColorOnBlack).to.eq('#FFF')
  })

  describe('releases', () => {
    const releaseApps = apps.filter(app => app.latestRelease)

    it('collects latest GitHub release data for apps that have it', () => {
      expect(releaseApps.length).to.be.above(50)
    })

    it('sets `latestRelease` on apps with GitHub repos that use Releases', () => {
      expect(releaseApps.every(app => app.latestRelease)).to.eq(true)
    })

    it('sets `latestReleaseFetchedAt`', () => {
      expect(releaseApps.every(app => app.latestReleaseFetchedAt)).to.eq(true)
    })
  })

  describe('readmes', () => {
    const readmeApps = apps.filter(app => app.readmeCleaned)

    it('collects READMEs for apps with GitHub repos', () => {
      expect(readmeApps.length).to.be.above(50)
    })

    it('sets `readmeCleaned`', () => {
      expect(readmeApps.every(app => app.readmeCleaned.length > 0)).to.eq(true)
    })

    it('sets `readmeOriginal`', () => {
      expect(readmeApps.every(app => app.readmeOriginal.length > 0)).to.eq(true)
    })

    it('sets `readmeFetchedAt`', () => {
      expect(readmeApps.every(app => app.readmeFetchedAt.length > 0)).to.eq(true)
    })
  })

  it('rewrites relative image source tags', () => {
    const beaker = apps.find(app => app.slug === 'beaker-browser')
    const local = '<img src="build/icons/256x256.png"'
    const remote = '<img src="https://github.com/beakerbrowser/beaker/raw/master/build/icons/256x256.png"'

    expect(beaker.readmeOriginal).to.include(local)
    expect(beaker.readmeOriginal).to.not.include(remote)

    expect(beaker.readmeCleaned).to.not.include(local)
    expect(beaker.readmeCleaned).to.include(remote)
  })

  it('rewrites relative link hrefs', () => {
    const app = apps.find(app => app.slug === 'google-play-music-desktop-player')
    const local = 'href="docs/PlaybackAPI.md"'
    const remote = 'href="https://github.com/MarshallOfSound/Google-Play-Music-Desktop-Player-UNOFFICIAL-/blob/master/docs/PlaybackAPI.md"'

    expect(app.readmeOriginal).to.include(local)
    expect(app.readmeOriginal).to.not.include(remote)

    expect(app.readmeCleaned).to.not.include(local)
    expect(app.readmeCleaned).to.include(remote)
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
