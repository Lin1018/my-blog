const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/myBlog');

var UserSchema = new mongoose.Schema({
    user:{
        type: String,
        unique: true
    },
    password: String
});

module.exports = mongoose.model('Users',UserSchema);
