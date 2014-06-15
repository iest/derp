var koa = require('koa');
var app = koa();
var logger = require('koa-logger');
var derp = require('./lib/derp');

// Global variables
var port = process.argv[2] || 3000;

// Middleware
app.use(logger());

// Setup derp
derp.setup(app);

// Now do the work and run the server
app.listen(port);
console.log('Listening on port', port);