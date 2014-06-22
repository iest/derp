var _ = require('lodash');
var fs = require('fs');
var rsvp = require('rsvp'),
  Promise = rsvp.Promise;

var parse = require('./derp/parse-post');
var defaults = require('./derp/defaults');

var config;
var allowedExtensions;
var _this = module.exports;

/**
 * Setup derp.
 * @param  {Object} config    Options for derp (see `defaults.js` for defaults)
 * @public
 */
module.exports.setup = function(opts) {

  if (opts) {
    this.config = _.extend(defaults, opts);
  } else {
    this.config = defaults;
  }

  config = this.config;

  // An array to store our posts in
  this.postsArr = [];

  // A map of `post_url: postsArr_index`
  this.postsMap = {};

  // A map of `post_path: post_url`
  this.postsMapByPath = {};

  // Create a regex from the array of allowed file extensions
  allowedExtensions = new RegExp(
    config.post_extensions.map(function(ext) {
      return "\\." + ext + "$";
    })
    .join('|')
  );

  return new rsvp.Promise(function(resolve, reject) {
    // Read the posts directory, parsing posts found within
    fs.readdir(config.post_directory, function(err, filePaths) {

      if (err) {
        return console.log(err);
      }
      if (!filePaths) {
        console.log('No posts exist in "%s"', config.post_directory);
        return;
      }

      // Filter out valid paths
      filePaths = filePaths.filter(function(path) {
        return allowedExtensions.test(path);
      });

      // Set up a promise for the parsing of each path
      var promises = filePaths.map(function(filePath) {
        return parse(config.post_directory + '/' + filePath);
      });

      // Execute the parse promises
      rsvp.allSettled(promises).then(function(parsed) {
        parsed.forEach(function(item) {

          // Only pull out fulfilled promises
          if (item.value) {
            addPost(item.value);
          } else {
            console.log(item.reason);
          }
        });
        resolve(_this);
      }).catch(function(reason) {
        console.log(reason);
      });
    });

    // Now setup the watcher
    fs.watch(config.post_directory, handleFileChanges);
  });
};

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
      if (_this.postsMapByPath[path]) {
        removePost(path);
      }

    } else if (err) {
      console.log(err);
    } else {

      // Otherwise it's either new or was changed
      parse(path)
        .then(function(newPost) {

          // If it existed, update it. Otherwise add a new post
          if (_this.postsMapByPath[newPost.path]) {
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
  if (_this.postsMap[post.url] !== undefined) {
    console.log('"%s" has the same URL as "%s". Ignoring...', post.path, _this.postsArr[_this.postsMap[post.url]].path);
    return false;
  } else {
    return true;
  }
}

/**
 * Add a post to `postsArr`.
 * Update `_this.postsMap`
 * Update `_this.postsMapByPath`
 * @param {Object} post
 * @private
 */
function addPost(post) {
  if (checkValidUrl(post)) {
    _this.postsArr.push(post);
    _this.postsMap[post.url] = _this.postsArr.indexOf(post);
    _this.postsMapByPath[post.path] = post.url;
  }
}

/**
 * Update the given post in derp.
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
 * Delete references from `postsMap` and `_this.postsMapByPath`
 * @param {String} path
 */
function removePost(path) {
  // TODO: removing a post fucks up the postsArr order, so the map values become incorrect
  var i = _this.postsMap[_this.postsMapByPath[path]];
  _this.postsArr.splice(i, 1);
  delete _this.postsMap[_this.postsMapByPath[path]];
  delete _this.postsMapByPath[path];
}

/**
 * Return the post with the given url
 * @param  {String} url
 * @public
 */
module.exports.getPost = function(url) {
  var post = _this.postsArr[_this.postsMap[url]];
  if (post) {
    return post;
  } else {
    console.log("No post exists at", url);
    return;
  }
};

/**
 * @return {Array} All the posts
 * @public
 */
module.exports.getAllPosts = function() {
  return _this.postsArr;
};