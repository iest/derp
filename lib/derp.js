var fs = require('fs');
var parse = require('./parse-post');
var config = require('../config');

var app;

/**
 * Parse all the posts, add them to `app.postsArr`.
 * Setup references in `app.postsMap` and `app.postsMapByPath`.
 * @param  {Application} app
 */
function setup(App) {
  app = App;

  // An array to store our posts in
  app.postsArr = [];

  // A map of `post_url: postsArr_index`
  app.postsMap = {};

  // A map of `post_path: post_url`
  app.postsMapByPath = {};

  fs.readdir(config.post_directory, function(err, filePaths) {
    if (err) return console.log(err);
    if (!filePaths) return console.log('No posts exist in the "%s" directory', config.post_directory);

    // Create a regex from the array of file extensions set in `config.js`
    var allowedExtensions = new RegExp(
      config.post_extensions.map(function(ext) {
        return "\\." + ext + "$";
      })
      .join('|')
    );

    // Check each file, parsing each one that matches an allowed extension and
    // pushing it into the `promises` array
    filePaths.forEach(function(filePath) {
      if (allowedExtensions.test(filePath)) {
        parse(config.post_directory + '/' + filePath)
          .then(function(post) {
            addPost(post);
          }, function(err) {
            console.log(err);
          });
      }
    });
  });

  // Now setup the watcher
  fs.watch(config.post_directory, handleFileChanges);
}

function handleFileChanges(event, filename) {
  var allowedExtensions = new RegExp(
    config.post_extensions.map(function(ext) {
      return "\\." + ext + "$";
    })
    .join('|')
  );

  // If the file isn't a post we care about, forget anything happened
  if (!allowedExtensions.test(filename)) {
    return;
  }

  // Try and read the file at `filename`
  var path = config.post_directory + '/' + filename;
  fs.stat(path, function(err, stats) {
    if (err && err.code === "ENOENT") {

      // If the file no longer exists, delete it
      if (app.postsMapByPath[path]) {
        removePost(path);
      }

    } else {

      // Otherwise it's either new or was changed
      parse(path)
        .then(function(newPost) {

          // If it existed, update it. Otherwise add the new post
          if (app.postsMapByPath[newPost.path]) {
            updatePost(newPost);
          } else {
            addPost(newPost);
          }
        }, function(err) {
          console.log(err);
        });

    }
  });
}

/**
 * Check if the given post has a unique URL compared to the posts we already have.
 * @param  {Object} post
 * @return {Boolean} If the post is valid or not
 */
function checkValidUrl(post) {
  if (app.postsMap[post.url] !== undefined) {
    console.log('"%s" has the same URL as "%s". Ignoring...', post.path, app.postsArr[app.postsMap[post.url]].path);
    return false;
  } else {
    return true;
  }
}

/**
 * Add a post to `postsArr`.
 * Update `app.postsMap`
 * Update `app.postsMapByPath`
 * @param {Object} post
 */
function addPost(post) {
  if (checkValidUrl(post)) {
    app.postsArr.push(post);
    app.postsMap[post.url] = app.postsArr.indexOf(post);
    app.postsMapByPath[post.path] = post.url;
  }
}

/**
 * If the post has a valid URL, update the post.
 * If the URL has become invalid, remove from the app.
 * @param  {Object} post
 */
function updatePost(post) {
  if (checkValidUrl(post)) {
    removePost(post.path);
    addPost(post);
  } else {
    removePost(post.path);
  }
}

/**
 * Find a post in `postsArr` by the given path.
 * Delete it out of `postsArr`.
 * Delete references from `postsMap` and `app.postsMapByPath`
 * @param {String} path
 */
function removePost(path) {
  var i = app.postsMap[app.postsMapByPath[path]];
  app.postsArr.splice(i, 1);
  delete app.postsMap[app.postsMapByPath[path]];
  delete app.postsMapByPath[path];
}

// Setup the public API
module.exports.setup = setup;
module.exports.addPost = addPost;
module.exports.updatePost = updatePost;
module.exports.removePost = removePost;