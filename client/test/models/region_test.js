// Tests for Region model class.
var Region = require("models/region");

describe ("Region", function () {
  it ("will be created with default values for its attributes", function () {
    var region = new Region();

    expect(region.get("name")).to.equal("");
    expect(region.get("type")).to.equal("");
  });

  it ("will set passed attributes on the model instance when created", function () {
    var region = new Region({
        name: "Some Region"
      , type: "header"
    });

    expect(region.get("name")).to.equal("Some Region");
    expect(region.get("type")).to.equal("header");
  });

  it ("will trigger an error event on failed validation.", function () {
    var spy = sinon.spy()
      , region = new Region();

    region.on("error", spy);

    region.set({type: "incorrect type"});

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith(region, "Region type must be header, footer, content or sidebar.");
  });
});
