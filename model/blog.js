const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/myBlog');

var BlogSchema = new mongoose.Schema({
    title: String,
    content: String
});

module.exports = mongoose.model('Blog',BlogSchema);
