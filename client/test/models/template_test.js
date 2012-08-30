// Tests for Template model class.
var Template = require("models/template");

describe ("Template", function () {
  it ("will be created with default values for its attributes", function () {
    var template = new Template();

    expect(template.get("name")).to.equal("");
    expect(template.get("template")).to.equal("");
    expect(template.get("build")).to.equal("");
  });

  it ("will set passed attributes on the model instance when created", function () {
    var template = new Template({
        name: "some-template"
      , template: "<div>{{test}}</div>"
      , build: "<div>test</div>"
    });

    expect(template.get("name")).to.equal("some-template");
    expect(template.get("template")).to.equal("<div>{{test}}</div>");
    expect(template.get("build")).to.equal("<div>test</div>");
  });
});
