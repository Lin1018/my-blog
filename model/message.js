const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/myBlog');

var MessageSchema = new mongoose.Schema({
    petName:String,
    description:String,
    src:String
});

module.exports = mongoose.model('Messages',MessageSchema);
