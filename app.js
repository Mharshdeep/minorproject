const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended: true}));

app.get("/",function(req,res) {
res.render("home");
})

app.get("/about",function(req,res) {
res.send("i am harshdeep")
})

app.get("/contact",function(req,res) {
res.send("8120529979")
})

app.get("/faculty-login",function(req,res) {
res.render("facultylogin")
})

app.get("/student-login",function(req,res) {
res.render("stdntlogin")
})
app.get("/register",function(req,res) {
res.render("register")  
})
app.listen(3000,function() {
  console.log("server started on port 3000");
})
