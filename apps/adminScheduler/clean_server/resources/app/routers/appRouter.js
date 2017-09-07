var passport = require('passport'),
    signupController = require('../controllers/signupController.js'),
    bcrypt = require('bcrypt'),
    Model = require('../models/models.js'),
      pg = require("pg"),//new
    LocalStrategy = require('passport-local').Strategy;

    var doctor = {//new
      user: 'postgres', //env var: PGUSER
      database: 'seq', //env var: PGDATABASE
      host: 'localhost', // Server hosting the postgres database
      port: 5432, //env var: PGPORT
      max: 10, // max number of clients in the pool
      idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
    }//new
    var doc = new pg.Client(doctor);//new
    doc.connect();//new
module.exports = function(express) {
  var router = express.Router()
  var cors = require('cors')
  router.use(cors());
    router.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    router.post('/what', function(req,res){
      res.send(req.query.username);
    });
  var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
      return next()
    req.flash('error', 'You have to be logged in to access the page.')
    res.redirect('/')
  }

  router.get('/getDocs', function(req,res){
      console.log(req.query.admin)
          var mystr = "SELECT username,first,last,city,specialty,id FROM users WHERE admin = 'admin'";
          var query = doc.query(mystr);
          query.on("row", function (row, result) {
              result.addRow(row);
          });
          query.on("end", function (result) {
              var json1 = JSON.stringify(result.rows, null, "    ");
              var json = JSON.parse(json1);
              for(var i = 0; i < json.length; i++) {
                 var obj = json[i];
              }
              console.log(json1)
              res.send(json1);
          })
  })
  router.get('/signup', signupController.show)
  router.post('/signup', function(req, res){
      console.log(req.query);
      var city = req.query.city
      var first = req.query.first
      var last = req.query.last
      var specialty = req.query.specialty
      var username = req.query.username
      var password = req.query.password
      var password2 = req.query.password2
      var admin = req.query.admin
    //  console.log(username);
      if (!username || !password || !password2) { //checks to make sure all fields filled in
//make sure all fields filled in
        res.send('error1');
      }
      else if (password !== password2) {
//passwords do not match
        res.send('error2');
      }
     else {
      var salt = bcrypt.genSaltSync(10)
      var hashedPassword = bcrypt.hashSync(password, salt)

      var newUser = {
        username: username,
        salt: salt,
        password: hashedPassword,
        admin: admin,
        first: first,
        last: last,
        city: city,
        specialty: specialty,
      }

      Model.User.create(newUser).then(function() { //.create will create a new record using the given input
    var mystr = "SELECT MAX(id) FROM users";
    var query = doc.query(mystr);
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        var json1 = JSON.stringify(result.rows, null, "    ");
        var json = JSON.parse(json1);
        for(var i = 0; i < json.length; i++) {
           var obj = json[i];
        }
        console.log("The json is: "+ json1)
        res.send(json1);
    })
      }).catch(function(error) {
      //  req.flash('error', "Please, choose a different username.")
         res.send('error3');
      })
    }
    })

  router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      req.logIn(user, function(err) {
        if (err) { res.send('error')}
       else{//return res.redirect('/users/' + user.username);
        res.send(user);} //perhaps make an sql query here and return the pkid of user
      });
    })(req, res, next);
  });
  router.get('/', function(req, res) {
    res.render('home')
  })

  router.get('/dashboard', isAuthenticated, function(req, res) {
    res.render('dashboard')
  })

  router.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
  })

  router.get('/hi',function(req,res){
    console.log('HI');
  })
  return router
}
