const categories = require('../lib/app-categories')
const mocha = require('mocha')
const describe = mocha.describe
const it = mocha.it
const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const yaml = require('yamljs')
const isUrl = require('is-url')
const cleanDeep = require('clean-deep')
const imageSize = require('image-size')
const slugg = require('slugg')
const slugs = fs.readdirSync(path.join(__dirname, '../apps'))
  .filter(filename => {
    return fs.statSync(path.join(__dirname, `../apps/${filename}`)).isDirectory()
  })

describe('human-submitted app data', () => {
  it('includes lots of apps', () => {
    expect(slugs.length).to.be.above(200)
  })

  slugs.forEach(slug => {
    describe(slug, () => {
      const basedir = path.join(__dirname, `../apps/${slug}`)
      const yamlFile = `${slug}.yml`
      const yamlPath = path.join(basedir, yamlFile)
      const iconPath = path.join(basedir, `${slug}-icon.png`)

      it('is in a directory whose name is lowercase with dashes as a delimiter', () => {
        expect(slugg(slug)).to.equal(slug)
      })

      it(`includes a data file named ${slug}.yml`, () => {
        expect(fs.existsSync(yamlPath)).to.equal(true)
      })

      describe(`${yamlFile}`, () => {
        const app = yaml.load(yamlPath)

        it('has a name', () => {
          expect(app.name.length).to.be.above(0)
        })

        it('has a description', () => {
          expect(app.description.length).to.be.above(0)
        })

        it('should not start description with app name', () => {
          expect(app.description.toLowerCase().indexOf(app.name.toLowerCase())).to.not.equal(0)
        })

        it('has a website with a valid URL', () => {
          expect(isUrl(app.website)).to.equal(true)
        })

        it('has a valid repository URL (or no repository)', () => {
          expect(!app.repository || isUrl(app.repository)).to.equal(true)
        })

        it('has an array of keywords, or none at all', () => {
          expect(!app.keywords || Array.isArray(app.keywords)).to.eq(true)
        })

        it('has a category', () => {
          expect(app.category.length).to.be.above(0)
        })

        it('has a valid category', () => {
          expect(app.category).to.be.oneOf(categories)
        })

        it('has no empty properties', () => {
          expect(cleanDeep(app)).to.deep.equal(app)
        })

        describe('screenshots', () => {
          const screenshots = app.screenshots || []

          it('requires imageUrl to be a fully-qualified HTTPS URL', () => {
            screenshots.forEach(screenshot => {
              expect(isUrl(screenshot.imageUrl) && /^https/.test(screenshot.imageUrl)).to.equal(true,
                `${app.slug} screenshot imageUrl must be a fully-qualified HTTPS URL`
              )
            })
          })

          it('requires linkUrl to be a fully-qualified URL, if present', () => {
            screenshots.forEach(screenshot => {
              expect(!screenshot.linkUrl || isUrl(screenshot.linkUrl)).to.equal(true,
                `${app.slug} screenshot linkURL must be a fully qualified URL`
              )
            })
          })
        })
      })

      describe('icon', () => {
        it(`exists as ${slug}-icon.png`, () => {
          expect(fs.existsSync(iconPath)).to.equal(true, `${slug}-icon.png not found`)
        })

        it('is a square', function () {
          if (!fs.existsSync(iconPath)) return this.skip()

          const dimensions = imageSize(iconPath)
          expect(dimensions.width).to.be.a('number')
          expect(dimensions.width).to.equal(dimensions.height)
        })

        it('is at least 128px x 128px', function () {
          if (!fs.existsSync(iconPath)) return this.skip()

          const dimensions = imageSize(iconPath)
          expect(dimensions.width).to.be.above(127)
        })

        it('is not more than 1024px x 1024px', function () {
          if (!fs.existsSync(iconPath)) return this.skip()

          const dimensions = imageSize(iconPath)
          expect(dimensions.width).to.be.below(1025)
        })
      })
    })
  })
})
