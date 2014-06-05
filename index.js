/*
  TODO:
  - Add posts dir option to config
  - Add allowed extensions for posts
 */

var _ = require('lodash');
var route = require('koa-route');
var logger = require('koa-logger');
var koa = require('koa');
var port = process.argv[2] || 3000;
var app = koa();

var render = require('./lib/renderer');
var parsePosts = require('./lib/parse-all-posts');
var gaze = require('gaze');

// Middleware
app.use(logger());

// Routes
app.use(route.get('/', list));
app.use(route.get('/:url', show));

var postsArr = [];
var postsMap = {};

var locals = {
  moment: require('moment')
};

function * list() {
  this.body = yield render('list', _.extend(locals, {
    posts: postsArr
  }));
}

function * show(url) {
  var post = postsArr[postsMap[url]];
  if (!post) this.throw(404, 'Post not found');
  this.body = yield render('post', _.extend(locals, {
    post: post
  }));
}


parsePosts('./posts')
  .then(function(posts) {
    postsArr = posts;

    postsArr.forEach(function(post, i) {
      postsMap[post.url] = i;
    });

    console.log(postsMap);

    app.listen(port);
    console.log('Listening on port', port);

  }, function(err) {
    console.log(err);
  });

// Watch all .js files/dirs in process.cwd()
gaze(['./posts/*.md', './posts/µ'], function(err, watcher) {
  // Files have all started watching
  // watcher === this

  // Get all watched files
  this.watched(function(err, watched) {
    console.log("watching", watched);
  });

  // On file changed
  this.on('changed', function(filepath) {
    console.log(filepath + ' was changed');
  });

  // On file added
  this.on('added', function(filepath) {
    console.log(filepath + ' was added');
  });

  // On file deleted
  this.on('deleted', function(filepath) {
    console.log(filepath + ' was deleted');
  });

  // On changed/added/deleted
  this.on('all', function(event, filepath) {
    console.log(filepath + ' was ' + event);
  });
});