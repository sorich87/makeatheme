// Tests for Block model class.
var Block = require("models/block");

describe ("Block", function () {
  it ("will be created with default values for its attributes", function () {
    var block = new Block();

    expect(block.get("name")).to.equal("");
    expect(block.get("filename")).to.equal("");
  });

  it ("will set passed attributes on the model instance when created", function () {
    var block = new Block({
        name: "Some Block"
      , filename: "somefile"
    });

    expect(block.get("name")).to.equal("Some Block");
    expect(block.get("filename")).to.equal("somefile");
  });
});
