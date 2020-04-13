require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "hey man how are you",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/minorDB", {
  useNewUrlParser: true,
  autoIndex: false,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  type: String,
  count: String,
  name: String
});

const studentData = new mongoose.Schema({
  email: String,
  project_title: String,
  project_description: String,
  gguide: String,
  mem1: String,
  enr1: String,
  mem2: String,
  enr2: String,
  mem3: String,
  enr3: String,
  mem4: String,
  enr4: String,
  gleader: String,
  gname: String,
  updates: {
    type: Array,
    default: []
  }

});

const Student = mongoose.model("student",studentData);

const facultyData = new mongoose.Schema({
  email: String
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", userSchema);



passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/", function(req, res) {
  res.render("home");
})


app.get("/about", function(req, res) {
  res.send("i am harshdeep")
});

app.get("/contact", function(req, res) {
  res.send("8120529979")
});

app.get("/faculty-login", function(req, res) {
  res.render("facultylogin")
});

app.get("/student-login", function(req, res) {
  res.render("stdntlogin")
});
app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/student-home", function(req, res) {
  if (req.isAuthenticated("local") && req.user.type=="student") {
Student.findOne({
  email: req.user.username
},function(err,result) {
if (result){
  console.log(result.project_title);
  res.render("student-home",{name: req.user.name,count : req.user.count,title: result.project_title ,updates: result.updates,updaestate: "pending",type: "/"+req.user.type+"-home"})
}else{
res.render("student-home",{name: req.user.name,count: req.user.count,type: "/"+req.user.type+"-home"});
}
});
}
else {
    res.redirect("/student-login");
  }
});

app.post("/fill-form",function(req,res) {
res.render("project-form",{name: "harshdeep singh",type: "/"+req.user.type+"-home"})
});

app.get("/show-form",function(req,res) {
  if (req.isAuthenticated("local")){
    if (req.user.type=="student"){
    Student.findOne({
      email: req.user.username
    },function(err,result) {
    if (result){
      res.render("show-form",{name: req.user.name,ptitle: result.project_title,gname: result.gname,gleader: result.gleader,gguide: "akankksha",
      desc: result.project_description,m1: result.mem1,eno1: result.enr1,m2: result.mem2,eno2: result.enr2,m3: result.mem3,eno3: result.enr3,m4: result.mem4,eno4: result.enr4,updates: result.updates,type: "/"+req.user.type+"-home"});
    }else{
    console.log("error");
    }
    });
  }
}
else{
  res.redirect("/")
}
}
);

app.get("/detail/:stid",function(req,res) {
const requestedId = req.params.stid;
Student.findOne({
  _id: requestedId
},function(err,result) {
  if(result){
    res.render("show-form-faculty",{name: req.user.name,ptitle: result.project_title,gname: result.gname,gleader: result.gleader,gguide: "akankksha",
    desc: result.project_description,m1: result.mem1,eno1: result.enr1,m2: result.mem2,eno2: result.enr2,m3: result.mem3,eno3: result.enr3,m4: result.mem4,eno4: result.enr4,updates: result.updates
  ,type: "/"+req.user.type+"-home"})
  }

});
});

app.get("/faculty-home", function(req, res) {
  if (req.isAuthenticated("local") && req.user.type=="faculty") {
    Student.find({gguide: req.user.name
  },function(err,result) {
if (result && result.length != 0) {
  res.render("faculty-home",{name: req.user.name,count: req.user.count,group: result,type: "/"+req.user.type+"-home"});
}else{
  res.render("faculty-home",{name: result.name,count : req.user.count,type:"/"+result.type+"-home"});
}
    });
  } else {
    res.redirect("/faculty-login");
  }
});

app.post("/register", function(req, res) {
  User.register({
    username: req.body.username,
    type: "student",
    count : "0",
    name: req.body.name
  }, req.body.password,function(err, student) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.render("student-home",{name: User.name,count: User.count,type: "/"+req.user.type+"-home"});
      });
    }
  });
});

app.post("/student-login", function(req, res) {
      const userName = req.body.username;
      const user = new User({
        email: req.body.username,
        password: req.body.password,
      });
      User.findOne({
            username: userName,
            type: "student"
          }, function(err, result) {
            if (result) {
              req.login(user, function(err) {
                    if (err) {
                      res.send("wrong password");
                    } else {
                      passport.authenticate('local')(req, res, function() {

                        Student.findOne({
                          email: result.username
                        },function(err,Result) {
                        if (Result){
                          res.render("student-home",{name: result.name,count : result.count,title: Result.project_title,updates: Result.updates,updaestate: "pending",type: "/"+req.user.type+"-home"})
                        }else{
                          res.render("student-home",{name: result.name,count: result.count,type: "/"+req.user.type+"-home"})
                        }
                        });

                      });
                      }
                    })
                  }
              else{
                res.send("account does not exist");
              }
                })
              })

app.get("/logout",function(req,res) {
              req.logout();
              res.redirect("/");
});

app.post("/student-home",function(req,res) {
  const i = 1
  const student = new Student({
    email: req.user.username,
    project_title: req.body.ptitle,
    project_description : req.body.desc,
    gguide: req.body.gguide,
    mem1: req.body.m1,
    enr1: req.body.eno1,
    mem2: req.body.m2,
    enr2: req.body.eno2,
    mem3: req.body.m3,
    enr3: req.body.eno3,
    mem4: req.body.m4,
    enr4: req.body.eno4,
    gleader: req.body.gleader,
    gname: req.body.gname
  });

student.save();
req.user.count = "1";
req.user.save();

Student.findOne({
  gguide: req.body.gguide
},function(err,result) {
if (result) {
  User.findOne({
    name: req.body.gguide
  },function(err,Result) {
if (Result) {
Result.count = "1";
Result.save();
}
});
}else{
  console.log("not found guide");
}
});
res.redirect("/student-home");
});

app.post("/submit-update",function(req,res) {
update = req.body.newupdate;
Student.findOne({email: req.user.username},function(err,result) {
  if(result){
    result.updates.push(update)
result.save();
  }
  else{
    console.log("not pushed");
  }

});
res.redirect("/student-home");
});

app.post("/faculty-login", function(req, res) {
      const userName = req.body.username;
      const user = new User({
        email: req.body.username,
        password: req.body.password,
      });
      User.findOne({
            username: userName,
            type: "faculty"
          }, function(err, result) {
            if (result) {
              req.login(user, function(err) {
                    if (err) {
                      res.send("wrong password");
                    } else {
                      passport.authenticate('local')(req, res, function() {
                        Student.find({gguide: result.name
                      },function(err,Result) {
                    if (Result && Result.length != 0) {
                      console.log(Result);
                      res.render("faculty-home",{name: result.name,count: result.count,group: Result,type: "/"+result.type+"-home"});
                    }else{
                      res.render("faculty-home",{name: result.name,count : result.count,group: Result,type:"/"+result.type+"-home"});
                    }
                        });
                        })
                      }
                    })
                  }
              else{
                res.send("account does not exist");
              }
                })
              })

              const port = process.env.PORT || 3000;

                    app.listen(port, function() {
                      console.log("server started on port 3000");
                    })
