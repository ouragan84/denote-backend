// basic server in node.js with express, serves static html files from public folder

// load the express module
const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

app.set('view engine', 'ejs');

// set the static files location /public/img will be /img for users
app.use(express.static(path.join(__dirname, 'public'))); 

// send our index.html file to the user for the home page
app.get('/', function(req, res) {
    res.render('home', {url: process.env.URL, version: process.env.VERSION});
});

// start the server
app.listen(process.env.PORT || 8080);
console.log('Server started! At http://localhost:' + process.env.PORT || 8080);
