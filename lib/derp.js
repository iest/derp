var _ = require('lodash');
var fs = require('fs');
var parsePosts = require('./parse-all-posts');
var parse = require('./parse-post');
var config = require('../config');

module.exports = function(app) {

  // An array to store our posts in
  app.postsArr = [];

  // A map of `post_url: {position: postsArr_index, filename: filename}`
  app.postsMap = {};

  // A map of `post_path: postsArr_index`
  var postsMapByPath = {};

  // Parse all the posts
  parsePosts(config.post_directory)
    .then(function(posts) {
      app.postsArr = posts;

      app.postsArr.forEach(function(post, i) {
        app.postsMap[post.url] = i;
        postsMapByPath[post.path] = i;
      });

      // Now setup the watcher
      setupWatcher();

    }, function(err) {
      console.error(err);
    });

  function setupWatcher() {
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

        // If the file no longer exists, it was deleted
        console.log(filename + " was deleted");
        if (postsMapByPath[path]) {
          // postsArr[postsMapByPath[path]] 
        }
      } else {

        // Otherwise it's either new or was changed
        console.log(filename + " was changed");
        parse(path).then(function(newPost) {

          console.log("changedPost: ", newPost);

          // If it existed, update it
          if (postsMapByPath[newPost.path]) {
            // debugger;
            app.postsArr[postsMapByPath[newPost.path]] = newPost;
            // debugger;
          }
        });

      }
    });
  }
};