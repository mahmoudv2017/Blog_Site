var mongoose = require('mongoose')
var local_passport = require('passport-local-mongoose')

var User_schema = new mongoose.Schema({
    username : String,
    password : String
})

User_schema.plugin(local_passport)

var Users = mongoose.model('Users' , User_schema)

module.exports = Users