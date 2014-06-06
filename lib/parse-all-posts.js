var fs = require('fs');
var parse = require('./parse-post');
var rsvp = require('rsvp');

module.exports = function(dirPath) {

  return new rsvp.Promise(function(resolve, reject) {
    fs.readdir(dirPath, function(err, filePaths) {

      if (err) reject(err);

      var promises = [];

      filePaths.forEach(function(filePath) {
        if (/\.md$/.test(filePath)) {
          promises.push(parse(dirPath + '/' + filePath));
        }
      });

      rsvp.all(promises)
        .then(function(parsed) {

          var urls = {};
          var posts = [];

          parsed.forEach(function(post) {
            if (urls[post.url]) {
              console.log("'" + urls[post.url] + "' has the same URL as '" + post.path + "'. Ignoring...");
            } else {
              urls[post.url] = post.path;
            }
          });

          resolve(posts);
        }, function(err) {
          reject(err);
        });

    });
  });
};