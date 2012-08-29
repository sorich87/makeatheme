// Tests for Theme model class.
var Theme = require("models/theme");

describe ("Theme", function () {
  it ("will be created with default values for its attributes", function () {
    var theme = new Theme();

    expect(theme.get("name")).to.equal("");
    expect(theme.get("author")).to.equal("");
    expect(theme.get("screenshot_uri")).to.equal("");
  });

  it ("will set passed attributes on the model instance when created", function () {
    var theme = new Theme({
        name: "Theme"
      , author: "Designer"
      , screenshot_uri: "/test/screenshot.png"
    });

    expect(theme.get("name")).to.equal("Theme");
    expect(theme.get("author")).to.equal("Designer");
    expect(theme.get("screenshot_uri")).to.equal("/test/screenshot.png");
  });

  it ("will set the id attribute on the model instance when created", function () {
    var theme = new Theme({_id: 12345});

    expect(theme.id).to.equal(12345);
  });
});
