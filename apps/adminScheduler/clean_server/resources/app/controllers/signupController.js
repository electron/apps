var bcrypt = require('bcrypt'),
    Model = require('../models/models.js')

module.exports.show = function(req, res) {
  res.render('signup')
}

module.exports.signup = function(req, res) {
  express = require('express');
  var cors = require('cors');
  var router = express.Router()
  router.use(cors());
  
  var username = req.query.username
  var password = req.query.password
  var password2 = req.query.password2

  var salt = bcrypt.genSaltSync(10)
  var hashedPassword = bcrypt.hashSync(password, salt)

  var newUser = {
    username: username,
    salt: salt,
    password: hashedPassword
  }

  Model.User.create(newUser).then(function() { //.create will create a new record using the given input
  res.send('success');
  console.log('did it')
  }).catch(function(error) {
    req.flash('error', "Please, choose a different username.")
    res.redirect('/signup')
  })
}
