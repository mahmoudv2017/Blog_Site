var express = require('express'),
    app = express(),
    request = require('request'),
    method_override = require('method-override'),
    body_parser = require('body-parser'),
    mongoo = require('mongoose'),
    sanitize = require('express-sanitizer'),
    blogs = require('./models/blogs'),
    Comments = require('./models/comments'),
    passport = require('passport')
    local_passport = require('passport-local'),
    Userss = require("./models/Users"),
    today = new Date()


app.use(require('express-session')({
    secret : 'ay7aga used to decode',
    saveUninitialized : false,
    resave : false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(Userss.serializeUser())
passport.use(new local_passport(Userss.authenticate()))
passport.deserializeUser(Userss.deserializeUser())

app.use(function(req,res,next){
    res.locals.current_user = req.user
    
    next()
})

app.set("view engine","ejs")
app.use(express.static("styles"))
app.use(body_parser.urlencoded({extended : true}))
app.use(method_override("_method"))
app.use(sanitize())

mongoo.connect('mongodb://localhost/blogs' , {useNewUrlParser : true , useUnifiedTopology : true})

function logged_in(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }else{
        res.redirect("/register")
    }
}



function delete_elemnt(arr,id){

    var result = []
    for(var i = 0 ; i < arr.length ; i++){
       
        if(arr[i] == id){
       
        }else{
            result.push(arr[i])
        }
    }
    return result
}


app.listen(8080,"localhost" , function(){
    console.log("server has started!!!")
})

//======================
//Main Routes
//======================

//Go To Home Page!!!
app.get("/index" , function(req , res){
    blogs.find({} , function(err,records){
        if(!err){
           
                res.render("blogs/index" , {blogs : records , current_user : req.user})
           
        }
    })
})
//Go To Edit Page!!!
app.get("/index/:id/edit",function(req,res){
    blogs.findById( req.params.id , function(err,record){
        if(!err){
            res.render('blogs/edit' , {records : record})
        }
    })
    
})
//Make an Edit Request
app.put("/index/:id" , function(req,res){
    
    blogs.findOneAndUpdate({ _id : req.params.id} ,{title : req.body.title , desc : req.body.desc , img :  req.body.image} , {useFindAndModify : false}).then(function(){
        console.log('done updated one record')
        res.redirect("/index")
    })
   
})
//Read / New page
app.get("/index/:id",function(req,res){
    if(req.params.id == 'new'){
        res.render('blogs/add')
    }
    blogs.findById(req.params.id).populate('comments').exec(function(err,blog){
      
        let current_user2 = req.user != null ? req.user.username : "no user"
        if(!err){
            
            res.render('blogs/read' , { blog : blog , error : '' , current_user2 : current_user2})
        }
    })

})
//Make a Delete Request
app.delete("/index/:id" , function(req,res){
    
    blogs.findOneAndDelete({_id : req.params.id} ).then(function(){
        res.redirect("/index")
    })
})
//Make a Create Request
app.post("/index",function(req,res){
   
    blogs.create({
        title : req.sanitize(req.body.title),
        desc : req.sanitize(req.body.desc),
        img : req.sanitize(req.body.image),
        time : today.toString().slice(0,15)

    }).then(function(){
        res.redirect("/index")
    })
})

//======================
//Comments Routes
//======================

app.get("/index/:blog_id/comments/:comment_id/edit" , function(req,res){

    if(req.user){
        Comments.findById(req.params.comment_id , function(err,comments){
        
            if(!err){
                if(req.user._id.toString() === comments.author.toString()){
                    res.render('Comment/EditComment' , {comment : comments})
                }else{
                    res.send("not yuor comment")
                }
            }
        })

    }else{
        res.redirect("/login")
    }
    
    
})
app.put("/index/comments/:comment_id" , function(req,res){
    Comments.findByIdAndUpdate(req.params.comment_id , { content : req.body.content}, { useFindAndModify : false } ).then(function(){
        res.redirect("/index")
    })
})
app.get("/index/:id/comments/new" , function(req,res){
    if(!req.user){
        res.redirect("/login")
    }
    else{
    blogs.findById(req.params.id,function(err,blog){
        if(!err){
            res.render('Comment/NewComment' , {main : blog})
        }
    })
}
    
})
app.post("/index/:id/comments" , function(req,res){

    Comments.create({
        title : req.user.username,
        content : req.body.content
    }, function(err,comment){
        if(!err){
            blogs.findById(req.params.id , function(err,blog){
                if(!err){
                    comment.author = req.user
                    comment.save()
                    blog.comments.push(comment)
                    blog.save()
            
                    res.redirect("/index")
                }
            })
        }
    })
})
app.delete("/index/:blog_id/:comment_id" , function(req,res){
    if(req.user){
        Comments.findById(req.params.comment_id , function(err,rec){
            if(!err){
                if(req.user._id.toString() == rec.author.toString()){
                    Comments.findByIdAndRemove(req.params.comment_id , {useFindAndModify : false}).then(function(){
                        blogs.findById(req.params.blog_id , function(err,blog){
                            blog.comments = delete_elemnt(blog.comments , req.params.comment_id)
                            blog.save()
                            blogs.findByIdAndUpdate({_id : req.params.blog_id} , { comments : blog.comments } , {useFindAndModify : false})
                            res.redirect("/index")
                            
                        })
                    })

                }else{
                    blogs.findById(req.params.blog_id).populate('comments').exec(function(err,blog){
                        if(!err){
 
                            res.render('blogs/read' , { blog : blog , error : "fuck you"})
                        }
                    })
                    
                }
            }
        })
        

    }else{
        res.redirect("/index")
    }
    
})


//======================
//Auth Routes
//======================

app.post("/login" , passport.authenticate("local" , {
    successRedirect : "/index",
    failureRedirect : "/register"
}) ,function(req,res){
    
})

app.get("/login" , function(req,res){
    res.render("Auth/login")
})

app.get("/register" , function(req,res){
    res.render('Auth/register')
})

app.post("/register" , function(req,res){
    var newUser = new Userss({username : req.body.username})
    Userss.register( newUser , req.body.password , function(err,rec){
        if(!err){
            passport.authenticate("local" )(req , res ,function(){
                res.redirect("/index")
            })
        }else{
            console.log(err)
        }
    })
})

app.get("/logout" , function(req,res){
    req.logOut()
    res.redirect("/index")
})



