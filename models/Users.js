var mongoo = require("mongoose")
var local_mongoo = require("passport-local-mongoose")


var User_schema = new mongoo.Schema({
    username : String,
    password : String
})

User_schema.plugin(local_mongoo)

module.exports = mongoo.model('Users' , User_schema)