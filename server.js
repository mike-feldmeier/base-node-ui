'use strict'

var fs             = require('fs');
var path           = require('path');

var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var stylus         = require('stylus');
var nib            = require('nib');

// Determine variables...
var app            = express();
var viewsDir       = __dirname + '/views';
var publicDir      = __dirname + '/public';
var routesDir      = __dirname + '/routes';
var stylusDir      = __dirname + '/stylus';
var cssDir         = publicDir + '/css';

// Configure middleware...
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

app.set('views', viewsDir);
app.set('view engine', 'jade');
app.use(stylus.middleware({ src: stylusDir, dest: cssDir, compile: compile }));

app.use(express.static(publicDir));

// Import route files...
fs.readdirSync(routesDir).forEach(function(f) {
  var mname = f.substring(0, f.length - 3);
  console.log('Importing route file "' + f + '" (' + mname + ')...');
  require(path.join(routesDir, mname))(app);
});

// Start server...
app.listen(3000, function() {
  console.log('Listening on port 3000');
});

// Helper method for compiling stylus templates...
function compile(s, path) {
  return stylus(s)
    .set('filename', path)
    .use(nib());
}
