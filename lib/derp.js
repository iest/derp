var _ = require('lodash');
var fs = require('fs');
var parsePosts = require('./parse-all-posts');
var parse = require('./parse-post');
var config = require('../config');

module.exports = function(app) {

  // An array to store our posts in
  app.postsArr = [];

  // A map of `post_url: postsArr_index`
  app.postsMap = {};

  // A map of `post_path: post_url`
  var postsMapByPath = {};

  // Parse all the posts
  parsePosts(config.post_directory)
    .then(function(posts) {
      app.postsArr = posts;

      app.postsArr.forEach(function(post, i) {
        app.postsMap[post.url] = i;
        postsMapByPath[post.path] = post.url;
      });

      // Now setup the watcher
      fs.watch(config.post_directory, handleFileChanges);

    }, function(err) {
      console.error(err);
    });

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
        parse(path)
          .then(function(newPost) {

            // If it existed, update it. Otherwise add the new post
            if (postsMapByPath[newPost.path]) {
              console.log(filename + " was updated.");
              var url = postsMapByPath[newPost.path];
              app.postsArr[app.postsMap[url]] = newPost;
            } else {
              console.log(filename + " was added.");
              app.postsArr.push(newPost);
              var i = app.postsArr.length - 1;
              app.postsMap[newPost.url] = i;
              postsMapByPath[newPost.path] = newPost.url;
            }
          });

      }
    });
  }
};