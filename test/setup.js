var should = require("should");
var derp = require("..");

describe("setup", function() {

  it("should add all valid fixture posts", function(done) {
    
    derp.setup({
      post_directory: "test/fixtures"
    }).then(function() {
      derp.getAllPosts().should.have.a.lengthOf(2);
      done();
    });
  });

});