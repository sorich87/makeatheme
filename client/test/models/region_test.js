// Tests for Region model class.
var Region = require("models/region");

describe ("Region", function () {
  it ("will be created with default values for its attributes", function () {
    var region = new Region();

    expect(region.get("name")).to.equal("");
    expect(region.get("slug")).to.equal("");
  });

  it ("will set passed attributes on the model instance when created", function () {
    var region = new Region({
        name: "header"
      , slug: "test"
    });

    expect(region.get("name")).to.equal("header");
    expect(region.get("slug")).to.equal("test");
  });

  it ("will trigger an error event on failed validation.", function () {
    var spy = sinon.spy()
      , region = new Region();

    region.on("error", spy);

    region.set({name: "incorrect name"});

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith(region, "Region must be header or footer.");
  });
});
