// Tests for Block model class.
var Block = require("models/block");

describe ("Block", function () {
  it ("will be created with default values for its attributes", function () {
    var block = new Block();

    expect(block.get("name")).to.equal("");
    expect(block.get("template")).to.equal("");
    expect(block.get("build")).to.equal("");
  });

  it ("will set passed attributes on the model instance when created", function () {
    var block = new Block({
        name: "somefile"
      , template: "<div>{{test}}</div>"
      , build: "<div>test</div>"
    });

    expect(block.get("name")).to.equal("somefile");
    expect(block.get("template")).to.equal("<div>{{test}}</div>");
    expect(block.get("build")).to.equal("<div>test</div>");
  });
});
