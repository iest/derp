var should = require("should");
var parse = require('../lib/derp/parse-post');

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
    parse("test/fixtures/Derp.md").then(function(post) {
      post.title.should.be.exactly("Derpy derp");
      done();
    });
  });

  it("creates a post with a meta title", function(done) {
    parse("test/fixtures/Derp.md").then(function(post) {
      post.title.should.be.exactly("Derpy derp");
      done();
    });
  });

  it("creates a post with a path", function(done) {
    parse("test/fixtures/Derp.md").then(function(post) {
      post.path.should.be.exactly("test/fixtures/Derp.md");
      done();
    });
  });

  it("creates a post with a URL", function(done) {
    parse("test/fixtures/Derp.md").then(function(post) {
      post.url.should.be.exactly("derp");
      done();
    });
  });

  it("creates a post with parsed markdown", function(done) {
    parse("test/fixtures/Derp.md").then(function(post) {
      console.log(post);
      post.content.should.be.exactly("<h1>Derpy derp</h1><p>This is some derpy content</p>");
      done();
    });
  });

});