var _ = require('lodash');
var fs = require('fs');
var parse = require('./derp/parse-post');
var defaults = require('./derp/defaults');

var app;
var config;

/**
 * Setup derp on our koa app.
 * @param  {Application} App    A koa app
 * @param  {Object} Config    Options for our app (see `defaults.js` for defaults)
 * @public
 */
function setup(App, Config) {
  app = App;

  if (Config) {
    app.config = _.extend(defaults, Config);
  } else {
    app.config = defaults;
  }

  config = app.config;

  // An array to store our posts in
  app.postsArr = [];

  // A map of `post_url: postsArr_index`
  app.postsMap = {};

  // A map of `post_path: post_url`
  app.postsMapByPath = {};

  // Create a regex from the array of allowed file extensions
  var allowedExtensions = new RegExp(
    config.post_extensions.map(function(ext) {
      return "\\." + ext + "$";
    })
    .join('|')
  );

  // Read the posts directory, parsing posts found within
  fs.readdir(config.post_directory, function(err, filePaths) {

    if (err) {
      return console.log(err);
    }
    if (!filePaths) {
      console.log('No posts exist in "%s"', config.post_directory);
      return;
    }

    // Loop through our filepaths
    filePaths.forEach(function(filePath) {

      // If this file is a post, parse it and add it to our app
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

/**
 * Listener callback for the watcher.
 * @param  {Event} event
 * @param  {String} filename
 */
function handleFileChanges(event, filename) {

  // If the file isn't a post we care about, forget anything happened
  if (!allowedExtensions.test(filename)) {
    return;
  }

  // Try and read the file at `filename`
  var path = config.post_directory + '/' + filename;
  fs.stat(path, function(err, stats) {
    if (err && err.code === "ENOENT") {

      // The watched file was deleted, so delete the post if there was one
      if (app.postsMapByPath[path]) {
        removePost(path);
      }

    } else if (err) {
      console.log(err);
    } else {

      // Otherwise it's either new or was changed
      parse(path)
        .then(function(newPost) {

          // If it existed, update it. Otherwise add a new post
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
 * Check if the given post has a unique URL compared to the posts we already
 * have.
 * @param  {Object} post
 * @return {Boolean} If the post is valid or not
 * @private
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
 * @private
 */
function addPost(post) {
  if (checkValidUrl(post)) {
    app.postsArr.push(post);
    app.postsMap[post.url] = app.postsArr.indexOf(post);
    app.postsMapByPath[post.path] = post.url;
  }
}

/**
 * Update the given post in the app.
 * If the URL was changed, `addPost` will handle it.
 * @param  {Object} post
 */
function updatePost(post) {
  removePost(post.path);
  addPost(post);
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

/**
 * Return a post from the given path
 * @param  {String} path
 * @public
 */
function getPost(path) {
  var post = app.postsArr[app.postsMap[path]];
  if (post) {
    return post;
  } else {
    console.log("No post exists at", path);
    return;
  }
}

/**
 * Get all the posts
 * @return {Array} All the posts
 * @public
 */
function getAllPosts() {
  return app.postsArr;
}

// Export the public API, just in case
module.exports.setup = setup;
module.exports.getPost = getPost;
module.exports.getAllPosts = getAllPosts;