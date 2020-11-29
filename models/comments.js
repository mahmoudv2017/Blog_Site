var mongoo = require('mongoose')
const { model } = require('./blogs')

var comment_schema = new mongoo.Schema({
    title : String,
    content : String,
    author : 
        {
            type : mongoo.Schema.Types.ObjectId,
            ref : "users"
        }
    

})

var Comments = mongoo.model('Comments', comment_schema)

module.exports = Comments