const { URL } = require('node:url')

const isUrl = (value) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

module.exports = { isUrl }
