var fs = require('fs');
var moment = require('moment');
var split = require('split');
var Promise = require('rsvp').Promise;
var md = require('marked');

module.exports = function(path) {

  var post = {
    content: "",
    path: path
  };

  var isMeta = true;

  return new Promise(function(resolve, reject) {
    fs.createReadStream(path)
      .pipe(split())
      .on('data', function(line) {

        // Pull out key-values
        if (isMeta) {

          // If we hit the first h1, we're done with the meta section
          if (line.charAt(0) === '#') {
            isMeta = false;
            post.title = line.slice(1).trim();
            return;
          }

          if (/:/.test(line)) {
            var key = line.split(':')[0].trim();
            var value = line.split(':')[1].trim();

            if (/date/i.test(key)) {
              value = moment(value);

              // Now check it was a valid date
              if (!value.valueOf()) {
                reject('Invalid date for post: ' + path);
              }
            }

            if (/tags/i.test(key)) {
              value = value.split(',');
              value.forEach(function(val) {
                val = val.trim();
              });
            }

            post[key] = value;
          }
        } else {
          post.content += line;
        }

      })
      .on('error', function(stuff) {
        reject(stuff);
      })
      .on('end', function() {
        resolve(post);
      });
  });
};