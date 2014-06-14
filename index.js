/**
 * index.js
 *
 * All the main stuff happens in here.
 * We set our app up, define methods for handling our routes, set template
 * locals and pull in all our posts.
 *
 * A quick note on middleware: The order of middleware is important. If any
 * *later* middleware `return`s, the stack unwinds, meaning *earlier* generators
 * are re-activated — hence why the `pageNotFound` middleware is near the top.
 */

/*
  TODO:
  - Watcher for posts dir, add/edit/delete
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

derp(app);

// Middleware
app.use(logger());
app.use(pageNotFound);
app.use(locals);

// Routes
app.use(route.get('/', list));
app.use(route.get('/:url', show));

// API
// app.use(route.get('/api', handle));
// app.use(route.post('/api', handle));
// app.use(route.put('/api', handle));
// app.use(route.delete('/api', handle));

// An array where we'll store our posts
var postsArr = app.postsArr = [];

// and a map of `post_url: {position: postsArr_index, filename: filename}` so we can do quick lookups and stuff
var postsMap = app.postsMap = {};

// Server methods
function * list() {
  this.body = yield render('list', _.extend(this.locals, {
    posts: app.postsArr
  }));
}

function * show(url) {
  var post = app.postsArr[postsMap[url]];
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