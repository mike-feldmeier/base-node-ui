'use strict'

// Require system libraries...
const fs = require('fs')
const path = require('path')

// Require user libraries...
const bodyparser = require('body-parser')
const bunyan = require('bunyan')
const dotenv = require('dotenv')
const envwrapper = require('env-wrapper')
const express = require('express')
const nib = require('nib')
const stylus = require('stylus')

// Know thyself...
const self = require('./package.json')

// Create local instances...
const app = express()
const logger = bunyan.createLogger({ name: self.name })

// Bring in environment variables with defaults...
dotenv.load()
const port = envwrapper.require('PORT', 3000)
const publicPath = envwrapper.require('PUBLIC_PATH', path.join(__dirname, 'public'))
const routesPath = envwrapper.require('ROUTES_PATH', path.join(__dirname, 'routes'))
const viewsPath = envwrapper.require('VIEWS_PATH', path.join(__dirname, 'views'))
const stylusPath = envwrapper.require('STYLUS_PATH', path.join(__dirname, 'stylus'))
const cssPath = envwrapper.require('CSS_PATH', path.join(publicPath, 'css'))

// Helper method to inject the logger into requests...
const injectLogger = (req, res, next) => {
  req.logger = logger
  next()
}

// Helper method to compile stylus stylesheets...
const compileStylus = (s, path) => {
  return stylus(s)
    .set('filename', path)
    .set('compress', true)
    .use(nib());
}

// Configure HTTP Listener...
app.set('views', viewsPath);
app.set('view engine', 'pug');
app.use(bodyparser.json())
app.use(injectLogger)
app.use(stylus.middleware({ src: stylusPath, dest: cssPath, compile: compileStylus }));
app.use(express.static(publicPath));

// Bring in route handlers...
fs.readdirSync(routesPath)
  .filter(fname => path.extname(fname) === '.js')
  .forEach(fname => {
    const mname = path.basename(fname, '.js')
    logger.info(`Importing routes file "${path.join(routesPath, fname)}" [${mname}]...`)
    require(path.join(routesPath, mname))(app)
  })

// Start HTTP Listener...
app.listen(port, err => {
  if(err) {
    logger.error(err, `Could not start the HTTP listener on port ${port}`)
  }
  else {
    logger.info(`Successfully started the HTTP listener on port ${port}`)
  }
})
