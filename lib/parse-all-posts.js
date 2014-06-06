var fs = require('fs');
var parsePost = require('./parse-post');
var rsvp = require('rsvp');
var config = require('../config');

module.exports = function(dirPath) {

  return new rsvp.Promise(function(resolve, reject) {
    fs.readdir(dirPath, function(err, filePaths) {

      if (err) reject(err);

      var promises = [];

      var allowedExtensions = new RegExp(config.post_extensions.map(function(ext) {
          return "\\." + ext + "$";
        })
        .join('|'));

      filePaths.forEach(function(filePath) {
        if (allowedExtensions.test(filePath)) {
          promises.push(parsePost(dirPath + '/' + filePath));
        }
      });

      rsvp.all(promises)
        .then(function(parsed) {

          var urls = {};
          var posts = [];

          parsed.forEach(function(post) {

            // Ignore posts without a url
            if (!post.url) return;

            if (urls[post.url]) {
              console.log("'" + post.path + "' has the same URL as '" + urls[post.url] + "'. Ignoring...");
            } else {
              urls[post.url] = post.path;
              posts.push(post);
            }
          });

          resolve(posts);
        }, function(err) {
          reject(err);
        });

    });
  });
};