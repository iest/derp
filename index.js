/**
 * index.js
 * 
 */

// Dependencies
var _ = require('lodash');
var route = require('koa-route');
var logger = require('koa-logger');
var koa = require('koa');
var views = require('co-views');
var gaze = require('gaze');
var app = koa();
var derp = require('./lib/derp');

// Global variables
var port = process.argv[2] || 3000;
var config = require('./config');
var render = views(config.view_directory, {
  default: config.template_extension
});

derp.setup(app);

// Middleware
app.use(logger());
app.use(pageNotFound);
app.use(locals);

// Routes
app.use(route.get('/', list));
app.use(route.get('/:url', show));

// Server methods
function * list() {
  this.body = yield render('list', _.extend(this.locals, {
    posts: app.postsArr
  }));
}

function * show(url) {
  var post = app.postsArr[app.postsMap[url]];
  if (!post) return;

  this.body = yield render('post', _.extend(this.locals, {
    post: post
  }));
}

function * pageNotFound(next) {
  yield next;
  if (this.body) return;
  this.status = 404;
  this.body = yield render('404');
}

function * locals(next) {
  this.locals = {
    moment: require('moment'),
    path: this.request.path
  };
  yield next;
}



// Now do the work and run the server
app.listen(port);
console.log('Listening on port', port);