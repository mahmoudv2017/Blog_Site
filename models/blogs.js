var mongoo = require("mongoose")

var today = new Date()


var blog_schema = new mongoo.Schema({
    title : String,
    img : String,
    time : String,
    desc : String,
    comments : [
        {
            type : mongoo.Schema.Types.ObjectId,
            ref : 'Comments'
        }
    ]
})


module.exports = mongoo.model('blogs' , blog_schema) 