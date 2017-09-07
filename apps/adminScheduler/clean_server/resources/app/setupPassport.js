var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt'),
    Model = require('./models/models.js')

module.exports = function(app) {
  app.use(passport.initialize()) //needed to support express
  app.use(passport.session())// for express

  passport.use(new LocalStrategy(
    function(username, password, done) {
      Model.User.findOne({
        where: {
          'username': username
        }
      }).then(function (user) { //gets called upon when findOne is fullfilled
        if (user == null) {
          return done(null, false, { message: 'Incorrect credentials.' })
        }

        var hashedPassword = bcrypt.hashSync(password, user.salt)

      //  console.log(user.id);

        //check if password matched password in DB
        if (user.password === hashedPassword) {
          return done(null, user)
        }
        //if not return invalid credentials
        return done(null, false, { message: 'Incorrect credentials.' })
      })
    }
  ))

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    Model.User.findOne({
      where: {
        'id': id
      }
    }).then(function (user) {
      if (user == null) {
        done(new Error('Wrong user id.'))
      }

      done(null, user)
    })
  })
}
