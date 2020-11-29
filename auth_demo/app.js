var express = require('express')
var body_parser = require('body-parser')
var passport = require('passport')
var local_passport = require('passport-local')
var mongoose = require('mongoose')
var Users = require('./models/User')
var app = express()
app.use(body_parser.urlencoded({extended : true}))
mongoose.connect("mongodb://localhost/auth_demo",{useNewUrlParser : true , useUnifiedTopology : true})


app.set('view engine' , 'ejs')
passport.use(new local_passport(Users.authenticate()))
app.use(require('express-session')({
    secret : "this is my decoder",
    resave : false,
    saveUninitialized : false
}))
app.use(passport.initialize()) //inilizes the passport.js
app.use(passport.session())  //inilizes a new session which is used for the logging as logging session and will save our login states
passport.serializeUser(Users.serializeUser()) //will encode our data into the database
passport.deserializeUser(Users.deserializeUser()) //decode the data






app.listen(8080 , "localhost" , function(){
    console.log("Server Has Started !!!")
})

function Is_loggedIN(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

//==========
//Routes
//==========
app.get("/" , function(req,res){
    res.render('home')
})

app.get("/register" , function(req,res){
    res.render('register')
})

app.get("/login" , function(req,res){
    res.render('login')
})

app.get('/secret' , Is_loggedIN , function(req,res){
    res.render("secret")
})
app.post("/login" , passport.authenticate("local" , {
   successRedirect : '/' ,
   failureRedirect : '/login'
}) , function(req,res){

})

app.get("/logout" , function(req,res){
    req.logOut()
    res.redirect("/")
})

app.post("/register" , function(req,res){
    console.log(req.body)
    Users.register(new Users({username : req.body.username}) , req.body.password , function(err,rec){
        if(!err){
            console.log("vefore")
            passport.authenticate("local")(req,res,function(){
                res.redirect("/")
            })
        }else{
            console.log(err)
        }
    })
})