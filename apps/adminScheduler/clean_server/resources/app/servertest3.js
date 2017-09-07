var express = require('express'),
    cors = require('cors'),
    app = express(),
    setupHandlebars  = require('./setupHandlebars.js')(app),
    setupPassport = require('./setupPassport'),
    flash = require('connect-flash'),
    appRouter = require('./routers/appRouter.js')(express),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    multer = require('multer'),
    pg = require("pg"),
    jsonParser = bodyParser.json()
    var yearmonthday;
    var port = process.env.PORT || 8080
    app.use(cors());
    app.use(cookieParser())
    app.use(session({ secret: '4564f6s4fdsfdfd', resave: false, saveUninitialized: false }))

    app.use('/styles', express.static(__dirname + '/styles'))

    app.use(flash())
    app.use(function(req, res, next) {
        res.locals.errorMessage = req.flash('error')
        next()
    });

    app.use(jsonParser)
    app.use(bodyParser.urlencoded({
      extended: true
    }))

    setupPassport(app)

    app.use('/', appRouter)

var pkid = 0;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); //needed to serve css

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');


var pes = {
  user: 'postgres', //env var: PGUSER used to be daniel
  database: 'pes2013restore', //env var: PGDATABASE
  password: 'admin', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
var doctor = {
  user: 'postgres', //env var: PGUSER used to be daniel
  database: 'doctor', //env var: PGDATABASE
  password: 'admin', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
}

var doctorUsers = {//new
  user: 'postgres', //env var: PGUSER
  database: 'seq', //env var: PGDATABASE
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
}//new

var curr_letters = "";
var client = new pg.Client(pes);
var doc = new pg.Client(doctor);
var users = new pg.Client(doctorUsers);
doc.connect();
users.connect();
client.connect();

//used to deal with CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/what', function(req,res){
  res.send(req.query.username);
});


app.post('/removeRequest', function(req,res){
  console.log("reached remove request")
  var pkid = req.query.pkid;
  doc.query("DELETE FROM request WHERE pkid="+pkid+"");
  res.send("request removed");
});

//clearR clears requests
app.post('/clearR', function(req,res){
  var id = req.query.user;
  doc.query("DELETE FROM request WHERE userid="+id+" AND update ='cancelled'");
  doc.query("UPDATE request SET update = 'd' WHERE (userid = '"+id+"') AND (update IS NOT NULL)");
  res.send("hi");
});
app.delete('/remove', function(req,res){
  //delete specified record based of pkid
  console.log(req.query.pkid);
  client.query("DELETE FROM esloc WHERE pkid="+req.query.pkid+"");
  res.send(req.query.pkid);
});
app.get('/removeAppointments', function(req,res){
  //delete specified record based of pkid
  pkid = req.query.id;
  admin = req.query.admin;
  var getName = doc.query("SELECT pfirst,requestid FROM operations WHERE pkid = '"+pkid+"'")
  getName.on("row", function (row, result) {
      result.addRow(row);
  });
  getName.on("end", function (result) {
      var json1 = JSON.stringify(result.rows, null, "    ");
      var json = JSON.parse(json1);
      for(var i = 0; i < json.length; i++) {
         var obj = json[i];
      }
      if(json[0].pfirst == null){
        doc.query("DELETE FROM operations WHERE pkid="+req.query.id+"");
      }
      else{
        if(admin == 'admin'){
          doc.query("DELETE FROM operations WHERE pkid="+pkid+"");
          console.log(pkid);
          pkid = parseInt(pkid)+1;
          console.log(pkid);
          doc.query("DELETE FROM operations WHERE pkid="+pkid+"");
          doc.query("UPDATE request SET update = 'cancelled' WHERE pkid = '"+json[0].requestid+"'");
        }
        else{
        doc.query("DELETE FROM operations WHERE pkid="+pkid+"");
        pkid = parseInt(pkid)-1;
        doc.query("DELETE FROM operations WHERE pkid="+pkid+"");
        doc.query("UPDATE request SET update = 'cancelled' WHERE pkid = '"+json[0].requestid+"'");
        }
      }
      res.send(json);
  })
});
app.post('/updateRequest', function(req,res){
  var update = req.query.update;
  var pkid = req.query.pkid;
  doc.query("UPDATE request SET update = '"+update+"' WHERE pkid = '"+pkid+"'")
    res.send("hi");
})

app.get('/getOperation', function(req,res){
    var pkid = req.query.pkid;
    var mystr = "SELECT * FROM operations WHERE (pkid='"+pkid+"') "
    var query = doc.query(mystr )
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        var json1 = JSON.stringify(result.rows, null, "    ");
        var json = JSON.parse(json1);
        for(var i = 0; i < json.length; i++) {
           var obj = json[i];
        }
        JSON1 = json;
        res.send(json);
    })

})
//whichDoc updates a users docId value to have the same value as the users own id
//this is needed to make determintations about what content to serve the end user
app.post('/whichDoc', function(req,res){
  var user = req.query.user;
  var docId = req.query.docId;
  users.query("UPDATE users SET docid = '"+docId+"' WHERE id = '"+user+"'")
  var getName = users.query("SELECT first, last,admin,id FROM users WHERE id = '"+docId+"'")
  getName.on("row", function (row, result) {
      result.addRow(row);
  });
  getName.on("end", function (result) {
      var json1 = JSON.stringify(result.rows, null, "    ");
      var json = JSON.parse(json1);
      for(var i = 0; i < json.length; i++) {
         var obj = json[i];
      }
      res.send(json);
  })

});
app.get('/getAppointments', function(req,res){
  var id = req.query.id;
  var JSON1;
  var docId = users.query("SELECT docId,admin FROM users WHERE id = '"+id+"'")
  var doctorSelected;
  docId.on("row", function (row, result) {
      result.addRow(row);
  });
  docId.on("end", function (result) {
      var json1 = JSON.stringify(result.rows, null, "    ");
      var json = JSON.parse(json1);
      for(var i = 0; i < json.length; i++) {
         var obj = json[i];
      }
      doctorSelected = json[0].docid;
      admin = json[0].admin;
      var mystr = "SELECT * FROM operations WHERE (userid='"+doctorSelected+"') "
      var query = doc.query(mystr )
      query.on("row", function (row, result) {
          result.addRow(row);
      });
      query.on("end", function (result) {
          var json1 = JSON.stringify(result.rows, null, "    ");
          var json = JSON.parse(json1);
          for(var i = 0; i < json.length; i++) {
             var obj = json[i];
          }
          var events = [];
          console.log(json);
          var color = "";
          var theTitle;
          for(var i=0; i<json.length; i++){
                if(admin == "admin"){
                   if(json[i].plast != null && json[i].plast != "null"){
                     theTitle = json[i].activity;
                   }
                   else{
                     theTitle = json[i].activity;
                   }
                }
                else{
                  if(json[i].dfirst !=null && doctorSelected == id){
                      theTitle = json[i].activity+" with Dr. "+json[i].dlast;
                  }
                  else if(doctorSelected != id && doctorSelected!=null && json[i].plast !=null && json[i].plast != "null"){
                      theTitle = json[i].activity;
                  }
                  else{
                    theTitle = json[i].activity;
                  }
                }
                var myevent = {
                    title: theTitle,
                    start: json[i].yearmonthday+"T"+json[i].start,
                    end: json[i].yearmonthday+"T"+json[i].end1,
                    id: json[i].pkid,
                    color: "#"+json[i].color,
                }
                events.push(myevent);
              }
              res.send(events);
            })
      })
  })

app.post('/requestAccepted', function(req,res){
  var stime = req.query.stime;
  var docid = req.query.docid;
  var etime = req.query.etime;
  var id = req.query.userid;
  var activity = req.query.activity;
  var yearmonthday = req.query.yearmonthday;
  var auto_insert = req.query.auto_insert;
  var first = req.query.first;
  var last = req.query.last;
  var dfirst = req.query.dfirst;
  var dlast = req.query.dlast;
  var auto_insert = req.query.auto_insert;
  var reqId = req.query.reqId;
  var sAMPM;
  var eAMPM
    if(stime.includes("AM")){
      sAMPM = "AM";
    }
    else{
      sAMPM = "PM";
    }
    if(stime.includes("AM")){
      eAMPM = "AM";
    }
    else{
      eAMPM = "PM";
    }
    var stime = getTime(stime, sAMPM);
    var etime = getTime(etime, eAMPM);
     mystr = "SELECT * FROM operations WHERE (userid='"+docid+"') AND ( ('"+stime+"'<= start AND '"+etime+"' >= end1) OR (start<='"+stime+"' AND end1>= '"+etime+"') OR (start <= '"+stime+"' AND end1 >= '"+stime+"') OR (start<= '"+etime+"' AND end1>= '"+etime+"')) AND (yearmonthday = '"+yearmonthday+"')" //this was used to select all elements belonging to a specific user
  if(auto_insert == "NO"){
    var query = doc.query(mystr )
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        var json1 = JSON.stringify(result.rows, null, "    ");
        var json = JSON.parse(json1);
        for(var i = 0; i < json.length; i++) {
           var obj = json[i];
        }
        JSON1 = json;
      if(json[0] == null){
         doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,pfirst,plast,dfirst,dlast,requestid) VALUES ('"+stime+"','"+etime+"','"+docid+"','"+activity+"','"+yearmonthday+"','"+first+"','"+last+"','"+dfirst+"','"+dlast+"','"+reqId+"')");
         doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,pfirst,plast,dfirst,dlast,requestid) VALUES ('"+stime+"','"+etime+"','"+id+"','"+activity+"','"+yearmonthday+"','"+first+"','"+last+"','"+dfirst+"','"+dlast+"','"+reqId+"')");
         res.send("inserted");
      } else {
        var i =0;
        var x =0;
        for(key in json){
          if (json[key].start == etime || json[key].end1 == stime){
            x++;
          }
          i++;
        }
        console.log("x = "+x);
          console.log("i = "+i);
        if(x==i){
        doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,pfirst,plast,dfirst,dlast,requestid) VALUES ('"+stime+"','"+etime+"','"+docid+"','"+activity+"','"+yearmonthday+"','"+first+"','"+last+"','"+dfirst+"','"+dlast+"','"+reqId+"')");
        doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,pfirst,plast,dfirst,dlast,requestid) VALUES ('"+stime+"','"+etime+"','"+id+"','"+activity+"','"+yearmonthday+"','"+first+"','"+last+"','"+dfirst+"','"+dlast+"','"+reqId+"')");
        res.send("inserted");
        }
        else{
            res.send(JSON1);
        }
      }
    })
  }
  else{
    doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,pfirst,plast,dfirst,dlast,requestid) VALUES ('"+stime+"','"+etime+"','"+docid+"','"+activity+"','"+yearmonthday+"','"+first+"','"+last+"','"+dfirst+"','"+dlast+"','"+reqId+"')");
    doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,pfirst,plast,dfirst,dlast,requestid) VALUES ('"+stime+"','"+etime+"','"+id+"','"+activity+"','"+yearmonthday+"','"+first+"','"+last+"','"+dfirst+"','"+dlast+"','"+reqId+"')");
    res.send("inserted");
  }
})
app.post('/request', function(req,res){
  var color = req.query.color1;
  var Stime = req.query.Stime;
  var docid = req.query.docid;
  var Shour;
  var Smin;
  var Ehour;
  var Emin;
  var Etime = req.query.Etime;
  var sAMPM = req.query.sAMPM;
  var eAMPM = req.query.eAMPM;
  var id = req.query.id;
  var activity = req.query.activity;
  var yearmonthday = req.query.yearmonthday;
  var auto_insert = req.query.auto_insert;
  var why = "2017-25-30?";
  var Stime = getTime(Stime, sAMPM);
  var Etime = getTime(Etime, eAMPM);
  var userinfo = users.query("SELECT first, last FROM users WHERE id = '"+id+"'")
  userinfo.on("row", function (row, result) {
      result.addRow(row);
  });
  userinfo.on("end", function (result) {
      var json1 = JSON.stringify(result.rows, null, "    ");
      var json = JSON.parse(json1);
      for(var i = 0; i < json.length; i++) {
         var obj = json[i];
      }
      JSON1 = json;
      first = json[0].first;
      last = json[0].last;
      var docName = users.query("SELECT first, last FROM users WHERE id = '"+docid+"'")
      docName.on("row", function (row, result) {
          result.addRow(row);
      });
      docName.on("end", function (result) {
          var json1 = JSON.stringify(result.rows, null, "    ");
          var json = JSON.parse(json1);
          for(var i = 0; i < json.length; i++) {
             var obj = json[i];
          }
          JSON1 = json;
          doc.query("INSERT INTO request (stime,etime,userid,activity,yearmonthday,docid,first,last,dfirst,dlast) VALUES ('"+Stime+"','"+Etime+"','"+id+"','"+activity+"','"+yearmonthday+"','"+docid+"','"+first+"','"+last+"','"+json[0].first+"','"+json[0].last+"')");
      })
  })
  res.send("inserted");
});
app.get('/getRequests', function(req,res){
  var docId = req.query.docid;
  var show = req.query.show;
  console.log(show);

  var docId = doc.query("SELECT * FROM request WHERE (docid = '"+docId+"')");
  docId.on("row", function (row, result) {
      result.addRow(row);
  });
  docId.on("end", function (result) {

      var json1 = JSON.stringify(result.rows, null, "    ");
      var json = JSON.parse(json1);


      for(var i = 0; i < json.length; i++) {
         var obj = json[i];
      }
      JSON1 = json;
      console.log("hi");
      console.log(json);
      var arr = [];
      if(show=="show"){
        console.log("MADE IT")
        for(var i = 0; i < json.length; i++) {
           if(json[i].update == null){
             arr.push(json[i])
           }
        }
        res.send(arr);
      }
      else{
      res.send(json);
    }
  })
});
app.get('/showUpdates', function(req,res){
  var user = req.query.user;
  var docId = doc.query("SELECT * FROM request WHERE (userid = '"+user+"')");
  docId.on("row", function (row, result) {
      result.addRow(row);
  });
  docId.on("end", function (result) {
      var json1 = JSON.stringify(result.rows, null, "    ");
      var json = JSON.parse(json1);
      for(var i = 0; i < json.length; i++) {
         var obj = json[i];
      }
      JSON1 = json;
      var arr = [];
        for(var i = 0; i < json.length; i++) {
           if(json[i].update != null && json[i].update != 'd'){
             arr.push(json[i])
           }
      }
      res.send(arr);
    })
  })




function getTime(time,AMPM){

    var time = time.split(":");

      hour = parseInt(time[0])
      if(hour<10){
        hour=0+hour.toString()
      }
      min = parseInt(time[1])
      if(min<10){
        min = 0+min.toString()
      }
     hour= parseInt(hour);
      if(AMPM == "PM"){
        if(hour!=12){
          hour = hour + 12;
        }
      }
      if(AMPM == "AM"){
        if(hour<10){
          hour = "0"+hour;
        }
      }
      hour.toString();
      time = hour+":"+min+":"+"00";
      return time;
}

app.post('/operation', function(req,res){
  var color = req.query.color1;
  var Stime = req.query.Stime;
  var Shour;
  var Smin;
  var Ehour;
  var Emin;
  var Etime = req.query.Etime;
  var sAMPM = req.query.sAMPM;
  var eAMPM = req.query.eAMPM;
  var id = req.query.id;
  var activity = req.query.activity;
  var requestAccepted = req.query.requestAccepted;
  var yearmonthday = req.query.yearmonthday;
  var auto_insert = req.query.auto_insert;
  var why = "2017-25-30?";
  var MStime = Stime;
  var MEtime = Etime;
  var Stime = getTime(Stime, sAMPM);
  var Etime = getTime(Etime, eAMPM);
  var JSON1;
  var mystr;
   mystr = "SELECT * FROM operations WHERE (userid='"+id+"') AND ( ('"+Stime+"'<= start AND '"+Etime+"' >= end1) OR (start<='"+Stime+"' AND end1>= '"+Etime+"') OR (start <= '"+Stime+"' AND end1 >= '"+Stime+"') OR (start<= '"+Etime+"' AND end1>= '"+Etime+"')) AND (yearmonthday = '"+yearmonthday+"')" //this was used to select all elements belonging to a specific user
if(auto_insert == "NO"){
  var query = doc.query(mystr )
  query.on("row", function (row, result) {
      result.addRow(row);
  });
  query.on("end", function (result) {
      var json1 = JSON.stringify(result.rows, null, "    ");
      var json = JSON.parse(json1);
      for(var i = 0; i < json.length; i++) {
         var obj = json[i];
      }
      JSON1 = json;
     if(json[0] == null){
      doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,color) VALUES ('"+Stime+"','"+Etime+"','"+id+"','"+activity+"','"+yearmonthday+"','"+color+"')");
      res.send("inserted");
    } else {
       var i =0;
       var x =0;
       while(i<json.length){
         if (json[i].start == Etime || json[i].end1 == Stime){
           x++;
         }
         i++;
       }
       if(x==i){
         doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,color) VALUES ('"+Stime+"','"+Etime+"','"+id+"','"+activity+"','"+yearmonthday+"','"+color+"')");
         res.send("inserted");
       }
       else{
           res.send(JSON1);
       }
    }
  })
}
else{
  doc.query("INSERT INTO operations (start,end1,userid,activity,yearmonthday,color) VALUES ('"+Stime+"','"+Etime+"','"+id+"','"+activity+"','"+yearmonthday+"','"+color+"')");
  res.send("inserted");
}
});

app.listen(3000, function () {
  console.log('CORS-enabled web server listening on port 3000')
})
