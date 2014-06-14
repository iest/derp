var gaze = require('gaze');
var fs = require('fs');
var config = require('../config');

module.exports = function(pattern) {

  function categoriseChange(event, filename) {
    var allowedExtensions = new RegExp(
      config.post_extensions.map(function(ext) {
        return "\\." + ext + "$";
      })
      .join('|')
    );

    // If the file isn't a post we care about, forget it
    if (!allowedExtensions.test(filename)) {
      return;
    }

    // Try and read the file at `filename`
    fs.stat(pattern + '/' + filename, function(err, stats) {
      if (err && err.code === "ENOENT") {

        // If the file no longer exists, it was deleted
        console.log(filename + " was deleted");
      } else {
        console.log(filename + " was changed");
      }
    });
  }

  fs.watch(pattern, categoriseChange);
};