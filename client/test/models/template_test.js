// Tests for Template model class.
var Template = require("models/template");

describe ("Template", function () {
  it ("will be created with default values for its attributes", function () {
    var template = new Template();

    expect(template.get("name")).to.equal("");
    expect(template.get("filename")).to.equal("");
    expect(template.get("current")).to.be.false;
  });

  it ("will set passed attributes on the model instance when created", function () {
    var template = new Template({
        name: "Some Template"
      , filename: "some-template"
      , current: true
    });

    expect(template.get("name")).to.equal("Some Template");
    expect(template.get("filename")).to.equal("some-template");
    expect(template.get("current")).to.be.true;
  });
});
