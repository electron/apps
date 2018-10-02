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
const makeColorAccessible = require('make-color-accessible')
const slugg = require('slugg')
const grandfatheredSlugs = require('../lib/grandfathered-small-icons')
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

        it('has a website with a valid URL (or no website)', () => {
          expect(!app.website || isUrl(app.website)).to.equal(true)
        })

        it('has a valid repository URL (or no repository)', () => {
          expect(!app.repository || isUrl(app.repository)).to.equal(true)
        })

        it('has an array of keywords, or none at all', () => {
          expect(!app.keywords || Array.isArray(app.keywords)).to.eq(true)
        })

        it('has a valid category', () => {
          expect(app.category.length).to.be.above(0)
          expect(app.category).to.be.oneOf(categories)
        })

        describe('colors', () => {
          it(`allows goodColorOnWhite to be set, but it must be accessible`, () => {
            // accessible: contrast ratio of 4.5:1 or greater (white background)
            const color = app.goodColorOnWhite
            if (color) {
              const accessibleColor = makeColorAccessible(color)
              expect(color === accessibleColor).to.equal(true,
                `${slug}: contrast ratio too low for goodColorOnWhite. Try: ${accessibleColor}`)
            }
          })

          it(`allows goodColorOnBlack to be set, but it must be accessible`, () => {
            // accessible: contrast ratio of 4.5:1 or greater (black background)
            const color = app.goodColorOnBlack
            if (color) {
              const accessibleColor = makeColorAccessible(color, {background: 'black'})
              expect(color === accessibleColor).to.equal(true,
                `${slug}: contrast ratio too low for goodColorOnBlack. Try: ${accessibleColor}`)
            }
          })

          it(`allows faintColorOnWhite to be set`, () => {
            const color = app.faintColorOnWhite
            if (color) {
              expect(color).to.match(/rgba\(\d+, \d+, \d+, /,
                `${slug}'s faintColorOnWhite must be an rgba string`
              )
            }
          })
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

        it('has a valid YouTube URL (or none)', () => {
          expect(!app.youtube_video_url || isUrl(app.youtube_video_url)).to.equal(true)
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

        const minPixels = (grandfatheredSlugs.indexOf(slug) > -1) ? 128 : 256
        const maxPixels = 1024

        it(`is between ${minPixels}px x ${minPixels}px and ${maxPixels}px x ${maxPixels}px`, function () {
          if (!fs.existsSync(iconPath)) return this.skip()
          const dimensions = imageSize(iconPath)
          expect(dimensions.width).to.be.within(minPixels, maxPixels)
          expect(dimensions.height).to.be.within(minPixels, maxPixels)
        })
      })
    })
  })
})
