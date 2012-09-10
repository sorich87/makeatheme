// Tests for Regions collection class.
var Regions = require("collections/regions");

describe ("Regions", function () {
  it ("will add Region instances as objects and arrays", function () {
    var regions = new Regions();

    expect(regions.length).to.equal(0);

    regions.add({
        slug: "test"
      , name: "header"
    });

    expect(regions.length).to.equal(1);

    regions.add([
      {
          slug: "test2"
        , name: "header"
      }
      , {
          slug: "test3"
        , name: "footer"
      }
    ]);

    expect(regions.length).to.equal(3);
  });
});
