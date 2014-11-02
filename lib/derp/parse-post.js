/**
 * This module will parse a post at a given `path`, asynchronously.
 * It'll read the file at the given path line-by-line using a stream interface
 * which not only keeps memory usage low, but also means we don't have to do
 * splitting and other silly string manipulation hacks to create our post model.
 *
 * It will handle a post as two sections: a meta portion at the top before the
 * first h1 tag, and a content portion below:
 *
 * ```markdown
 * Title: This is the title
 * Date: 2nd November 2014
 * URL: test
 *
 * # This is the heading
 *
 * Here's some content...
 * ```
 *
 * Derp will read and process markdown files written in this way, outputting the
 * following for the above example:
 *
 * ```js
 * var post = derp.getPost('test');
 * post === {
 *   title: "This is the title",
 *   date: Sun Nov 02 2014 00:00:00 GMT+0000 (GMT),
 *   url: "test",
 *   content: "<h1>This is the heading</h1><p>Here's some content</p>"
 * }
 * ```
 *
 * The whole thing is wrapped in a promise, making it super easy to handle.
 */

var fs = require('fs');
var split = require('split');
var RSVP = require('rsvp');
var md = require('marked');

module.exports = function(path) {
  return new RSVP.Promise(function(resolve, reject) {

    // We'll assume we're reading the meta portion of our post at the start
    var isMeta = true;

    // Our basic post model
    var post = {
      content: "",
      path: path
    };

    // We'll keep the previous line just in case
    var previousLine = '';

    // Begin reading the file at the path, splitting on newlines
    fs.createReadStream(path)
      .pipe(split())
      .on('data', function(line) {

        if (isMeta) {

          var h1TypeHash = /^#[^#]/.test(line);
          var h1TypeEquals = /^=/.test(line);

          if (h1TypeEquals || h1TypeHash) {
            var shouldReturn = !post.title;

            isMeta = false;

            if (!post.title && h1TypeEquals) {
              post.title = previousLine.trim();
            }

            if (!post.title && h1TypeHash) {
              post.title = line.slice(1).trim();
            }

            if (shouldReturn) return;
          }

          // If the line has a `key:value` and no whitespace
          if (/^.*:./.test(line)) {

            // Pull out the keys & values and trim whitespace
            var key = line.split(':')[0].trim().toLowerCase();
            var value = line.split(':')[1].trim();

            // Ignore whitespace
            if (/\s/.test(key)) {
              return;
            }

            // If there's a date meta, create a Date object
            if (/date/i.test(key)) {
              value = new Date(value);

              // Now check it was a valid date
              if (!value.valueOf()) {
                console.log("'" + path + "' has an invalid date.");
              }
            }

            // If there's `tags` meta, split the values into an array
            if (/^tags/i.test(key)) {
              value = value.split(',').map(function(val) {
                return val.trim();
              });
            }

            // Now set the value on the post model
            post[key] = value;
          }
        }

        if (!isMeta) {
          post.content += line + '\n';
        }

        previousLine = line;

      })
      .on('error', function(err) {

        // Now with each line...
        reject(err);
      })
      .on('end', function() {

        // If we still think we're looking at meta, there was no
        // h1 in the post
        if (isMeta) {
          return reject("The post '" + path + "' did not contain a h1, which is required. Ignoring...");
        }

        if (!post.url) {
          return reject("The post '" + path + "' did not specify a URL, which is required. Ignoring...");
        }

        // Once we're done, parse the markdown and resolve the promise
        post.content = md(post.content);
        resolve(post);
      });
  });
};