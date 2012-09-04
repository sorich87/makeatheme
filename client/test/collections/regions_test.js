// Tests for Regions collection class.
var Regions = require("collections/regions");

describe ("Regions", function () {
  it ("will add Region instances as objects and arrays", function () {
    var regions = new Regions();

    expect(regions.length).to.equal(0);

    regions.add({
        name: "Some Region"
      , type: "header"
    });

    expect(regions.length).to.equal(1);

    regions.add([
      {
          name: "Another Region"
        , type: "header"
      }
      , {
          name: "A Last Region"
        , type: "footer"
      }
    ]);

    expect(regions.length).to.equal(3);
  });
});
