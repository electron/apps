const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const pathExists = require('path-exists').sync
const yaml = require('yamljs')
const isUrl = require('is-url')
const cleanDeep = require('clean-deep')
const imageSize = require('image-size')
const slugg = require('slugg')
const slugs = fs.readdirSync(path.join(__dirname, '/apps'))
  .filter(filename => {
    return fs.statSync(path.join(__dirname, `/apps/${filename}`)).isDirectory()
  })

describe('electron-apps', () => {
  it('includes lots of apps', () => {
    expect(slugs.length).to.be.above(200)
  })

  slugs.forEach(slug => {
    describe(slug, () => {
      const basedir = path.join(__dirname, `/apps/${slug}`)
      const yamlFile = `${slug}.yml`
      const yamlPath = path.join(basedir, yamlFile)
      const iconPath = path.join(basedir, `${slug}-icon.png`)

      it('is in a directory whose name is lowercase with dashes as a delimiter', () => {
        expect(slugg(slug)).to.equal(slug)
      })

      it(`includes a data file named ${slug}.yml`, () => {
        expect(pathExists(yamlPath)).to.equal(true)
      })

      describe(`${yamlFile}`, () => {
        const app = yaml.load(yamlPath)

        it('has a name', () => {
          expect(app.name).to.not.be.empty
        })

        it('has a description', () => {
          expect(app.description).to.not.be.empty
        })

        it('has a website with a valid URL', () => {
          expect(isUrl(app.website)).to.equal(true)
        })

        it('has a valid repository URL (or no repository)', () => {
          expect(!app.repository || isUrl(app.repository)).to.equal(true)
        })

        it('has no empty properties', () => {
          expect(cleanDeep(app)).to.deep.equal(app)
        })
      })

      describe('icon', () => {
        it(`exists as ${slug}-icon.png`, () => {
          expect(pathExists(iconPath)).to.equal(true, 'no icon file found')
        })

        it('is a square', () => {
          const dimensions = imageSize(iconPath)
          expect(dimensions.width).to.be.a('number')
          expect(dimensions.width).to.equal(dimensions.height)
        })

        it('is at least 100px x 100px', () => {
          if (pathExists(iconPath)) {
            const dimensions = imageSize(iconPath)
            expect(dimensions.width).to.be.above(99)
          }
        })
      })
    })
  })
})
