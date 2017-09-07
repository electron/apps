var cleanup = require('./tests/utils/cleanup.js')

cleanup(function() {
  console.log('Setup finished.')
  process.exit()
})