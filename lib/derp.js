var _ = require('lodash');
var fs = require('fs');
var RSVP = require('rsvp');
var parse = require('./derp/parse-post');
var defaults = require('./derp/defaults');
var invariant = require('invariant');

var postsArr = [];
var postsMap = {};

function isValidURL(post) {
  return typeof postsMap[post.url] === 'undefined';
}

function _addPost(post) {
  if (isValidURL(post)) {
    postsArr.push(post);
    postsMap[post.url] = postsArr.indexOf(post);
  }
}

module.exports = {

  /**
   * Return a single post.
   * @param  {String} url
   * @return {Object}     Will be undefined if no post exists at the URL.
   */
  getPost: function getPost(url) {
    return postsArr[postsMap[url]];
  },

  /**
   * Return all the posts (unsorted).
   * @return {Array}
   */
  getAllPosts: function getAllPosts() {
    return postsArr;
  },

  /**
   * Initialise Derp.
   * @param  {Object} [opts] Options
   * @return {Promise}       Resolves with all the posts after parsing.
   */
  init: function init(opts) {

    var config = _.extend(defaults, opts || {});
    var _this = this;

    invariant(
      config.post_directory,
      "derp.init(...): Post directory is not defined."
    );

    invariant(
      config.post_extensions,
      "derp.init(...): Allowed post extensions are not defined."
    );

    var allowedExtensions = new RegExp(
      config.post_extensions.map(function(ext) {
        return "\\." + ext + "$";
      })
      .join('|')
    );

    return new RSVP.Promise(function(resolve, reject) {
      fs.readdir(config.post_directory, function(err, filePaths) {

        if (err) {
          return reject(err);
        }

        var promises = filePaths.filter(function(path) {
          return allowedExtensions.test(path);
        }).map(function(path) {
          return parse(config.post_directory + '/' + path);
        });

        RSVP.allSettled(promises).then(function(posts) {
          posts.forEach(function(post) {

            if (post.value) {
              _addPost(post.value);
            } else {
              console.log(post.reason);
            }
          });
          resolve(_this.getAllPosts());
        });

      });
    });
  },

  reset: function reset() {
    postsArr = [];
    postsMap = {};
  }
};