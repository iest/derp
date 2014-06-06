/**
 * parse-all-posts.js
 *
 * Asychronously read the the given directory, parsing files that match the
 * allowed post file extensions set in `config.js`, ignoring posts without URLs.
 * 
 * All wrapped in a promise to make it easy to handle.
 */

var fs = require('fs');
var parsePost = require('./parse-post');
var rsvp = require('rsvp');
var config = require('../config');

module.exports = function(dirPath) {
  return new rsvp.Promise(function(resolve, reject) {
    fs.readdir(dirPath, function(err, filePaths) {

      if (err) reject(err);

      // We'll store a bunch of promises in here later
      var promises = [];

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
          promises.push(parsePost(dirPath + '/' + filePath));
        }
      });

      // Wait for all the promises to resolve...
      rsvp.all(promises)
        .then(function(parsed) {

          // We'll store already-used urls so we can ignore duplicates
          var urls = {};

          // Posts that are ok will be put in here
          var posts = [];

          parsed.forEach(function(post) {

            // Ignore posts without a url
            if (!post.url) return;

            // If we already have a post with the given url, ignore it
            if (urls[post.url]) {
              console.log("'" + post.path + "' has the same URL as '" + urls[post.url] + "'. Ignoring...");
            } else {

              // Otherwise store the url
              urls[post.url] = post.path;

              // and push the parsed post into the `posts` array
              posts.push(post);
            }
          });

          // Now resolve the posts
          resolve(posts);
        }, function(err) {
          reject(err);
        });

    });
  });
};