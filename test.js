const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const pathExists = require('path-exists').sync
const yaml = require('yamljs')
const isUrl = require('is-url')
const cleanDeep = require('clean-deep')
const slugg = require('slugg')
const slugs = fs.readdirSync(path.join(__dirname, '/apps'))

describe('electron-apps', () => {

  it('includes lots of apps', () => {
    expect(slugs.length).to.be.above(80)
  })

  slugs.forEach(slug => {
    describe(slug, () => {
      const basedir = path.join(__dirname, `/apps/${slug}`)
      const yamlFile = `${slug}.yml`
      const yamlPath = path.join(basedir, yamlFile)
      const pngPath = path.join(basedir, `${slug}.png`)
      const svgPath = path.join(basedir, `${slug}.svg`)

      it('is in a directory whose name is lowercase with dashes as a delimiter', () => {
        expect(slugg(slug)).to.equal(slug)
      })

      it(`includes a data file named ${slug}.yml`, () => {
        expect(pathExists(yamlPath)).to.equal(true)
      })

      it(`includes an icon named named ${slug}.png or ${slug}.svg`, () => {
        expect(pathExists(pngPath) || pathExists(svgPath)).to.equal(true)
      })

      describe(`${yamlFile}`, () => {
        const app = yaml.load(yamlPath)

        it('has a name', () => {
          expect(app.name).to.not.be.empty
        })

        it('has a description', () => {
          expect(app.description).to.not.be.empty
        })

        it('has a valid repository URL (or no repository)', () => {
          expect(!app.repository || isUrl(app.repository)).to.equal(true)
        })

        it('has no empty properties', () => {
          expect(cleanDeep(app)).to.deep.equal(app)
        })
      })
    })
  })
})
