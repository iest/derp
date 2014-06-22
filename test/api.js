var should = require("should");
var derp = require("..");

describe("setup", function() {

  it("should return a resolved promise", function(done) {
    derp.setup({
      post_directory: "test/fixtures"
    }).then(function(stuff) {
      stuff.should.be.ok;
      done();
    });
  });
});

describe('getPost', function() {
  beforeEach(function(done) {
    derp.setup({
      post_directory: "test/fixtures"
    }).then(function() {
      done();
    });
  });

  it("should return the specified post", function(done) {
    derp.getPost("derp").url.should.be.exactly("derp");
    done();
  });

  it("should return undefined if the post doesn't exist", function(done) {
    should.not.exist(derp.getPost('HERP'));
    done();
  });

});

describe('getAllPosts', function() {
  beforeEach(function(done) {
    derp.setup({
      post_directory: "test/fixtures"
    }).then(function() {
      done();
    });
  });

  it('should by default return an array of posts', function(done) {
    console.log(derp.getAllPosts());
    derp.getAllPosts().length.should.be.ok;
    done();
  });
});
