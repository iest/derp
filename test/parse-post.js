var should = require("should");
var parse = require('../lib/derp/parse-post');
var _ = require('lodash');

describe("parse post", function() {

  it("ignores posts without a h1", function(done) {
    parse("test/fixtures/no title.md").then(null, function(err) {
      err.should.be.ok;
      done();
    });
  });

  it("ignores posts without a URL", function(done) {
    parse("test/fixtures/no url.md").then(null, function(err) {
      err.should.be.ok;
      done();
    });
  });

  it("creates a post with a title if no title meta is set", function(done) {
    parse("test/fixtures/post.md").then(function(post) {
      post.title.should.be.exactly("Title set in content");
      done();
    });
  });

  it("creates a post with a meta title", function(done) {
    parse("test/fixtures/post with meta title.md").then(function(post) {
      post.title.should.be.exactly("Title set in meta");
      done();
    });
  });

  it("creates a post with a path", function(done) {
    parse("test/fixtures/post.md").then(function(post) {
      post.path.should.be.exactly("test/fixtures/post.md");
      done();
    });
  });

  it("creates a post with a URL", function(done) {
    parse("test/fixtures/post.md").then(function(post) {
      post.url.should.be.exactly("derp");
      done();
    });
  });

  it("creates a post with parsed markdown, including the first h1 if title is set as a meta key", function(done) {
    parse("test/fixtures/post with meta title.md").then(function(post) {
      post.content.should.be.exactly('<h1 id="title-should-be-set-in-meta">Title should be set in meta</h1>\n<p>This is some derpy content</p>\n');
      done();
    });
  });

  it("creates a post with parsed markdown, excluding the title if no meta title key is present", function(done) {
    parse("test/fixtures/post.md").then(function(post) {
      post.content.should.be.exactly("<p>This is some derpy content</p>\n");
      done();
    });
  });

  it("creates a post with tags if they are supplied", function(done) {
    parse('test/fixtures/post with tags.md').then(function(post) {
      _.isEqual(post.tags, ['one', 'two', 'three']).should.be.ok;
      done();
    });
  });

  it("allows case insensitive key names in the meta portion", function(done) {
    parse('test/fixtures/post with many keys.md').then(function(post) {
      post.url.should.equal('derp');
      post.author.should.equal('me');
      _.isEqual(post.tags, ['one', 'two', 'three']).should.be.ok;
      done();
    });
  });

});