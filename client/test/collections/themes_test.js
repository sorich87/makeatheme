// Tests for Themes collection class.
var Themes = require("collections/themes");

describe ("Themes", function () {
  it ("will add Theme instances as objects and arrays", function () {
    var themes = new Themes();

    expect(themes.length).to.equal(0);

    themes.add({
        name: "Some Theme"
      , author: "Some Author"
      , screenshot_uri: "/test/screenshot1.png"
    });

    expect(themes.length).to.equal(1);

    themes.add([
      {
          name: "Another Theme"
        , author: "Another Author"
        , screenshot_uri: "/test/screenshot2.png"
      }
      , {
          name: "A Last Theme"
        , author: "A Last Author"
        , screenshot_uri: "/test/screenshot3.png"
      }
    ]);

    expect(themes.length).to.equal(3);
  });
});
