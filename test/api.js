var should = require("should");
var derp = require("..");
var parse = require("../lib/derp/parse-post");

describe('derp', function() {

  describe('init', function() {
    it("returns a resolved promise containing parsed posts", function(done) {
      derp.init({
        post_directory: "test/fixtures"
      })
        .then(function(stuff) {
          stuff.should.be.ok;
          done();
        });
    });

    it("rejects if the post directory cannot be found", function(done) {
      derp.init({
        post_directory: "not/a/real/path"
      })
        .then(null, function(stuff) {
          done();
        });
    });
  });

  describe('getPost', function() {
    beforeEach(function(done) {
      derp.init({
        post_directory: "test/fixtures"
      })
        .then(function() {
          done();
        });
    });

    it("returns the specified post", function(done) {
      derp.getPost("derp").url.should.be.ok;
      done();
    });

    it("returns undefined if the post doesn't exist", function(done) {
      should.not.exist(derp.getPost('HERP'));
      done();
    });

  });

  describe('getAllPosts', function() {
    beforeEach(function(done) {
      derp.init({
        post_directory: "test/fixtures"
      })
        .then(function() {
          done();
        });
    });

    it('returns an array of posts', function(done) {
      derp.getAllPosts().length.should.be.ok;
      done();
    });
  });

  describe('reset', function() {
    it("empties all the posts", function() {
      derp.init({
        post_directory: "test/fixtures"
      })
        .then(function() {
          derp.getAllPosts().length.should.be.exactly(0);
          done();
        });
    });
  });

});