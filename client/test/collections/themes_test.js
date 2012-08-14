// Tests for Themes collection class.
var Themes = require("collections/themes");

describe ("Themes", function () {
  it ("will add Theme instances as objects and arrays", function () {
    var themes = new Themes();

    expect(themes.length).to.equal(0);

    themes.add({
        name: "Some Theme"
      , author: "Some Author"
      , author_uri: "http://someauthor.com/"
    });

    expect(themes.length).to.equal(1);

    themes.add([
      {
          name: "Another Theme"
        , author: "Another Author"
        , author_uri: "http://anotherauthor.com/"
      }
      , {
          name: "A Last Theme"
        , author: "A Last Author"
        , author_uri: "http://alastauthor.com/"
      }
    ]);

    expect(themes.length).to.equal(3);
  });
});
