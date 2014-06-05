var fs = require('fs');
var parse = require('./parse-post');
var rsvp = require('rsvp');
var _ = require('lodash');

module.exports = function(dirPath) {

  return new rsvp.Promise(function(resolve, reject) {
    fs.readdir(dirPath, function(err, files) {

      if (err) reject(err);

      var promises = [];
      var invalidPaths = [];

      files.forEach(function(filePath) {

        // Check if we already have
        if (_(invalidPaths).contains(filePath)) {
          console.log("There is already a post with the URL", filePath, ".");
          return;
        }
        if (/\.md$/.test(filePath)) {
          promises.push(parse(dirPath + '/' + filePath));
          invalidPaths.push(filePath);
        }
      });

      rsvp.all(promises)
        .then(function(posts) {
          resolve(posts);
        }, function(err) {
          reject(err);
        });

    });
  });
};