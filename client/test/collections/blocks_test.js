// Tests for Blocks collection class.
var Blocks = require("collections/blocks");

describe ("Blocks", function () {
  it ("will add Block instances as objects and arrays", function () {
    var blocks = new Blocks();

    expect(blocks.length).to.equal(0);

    blocks.add({
        name: "Some Block"
      , filename: "somefile"
    });

    expect(blocks.length).to.equal(1);

    blocks.add([
      {
          name: "Another Block"
        , filename: "anotherfile"
      }
      , {
          name: "A Last Block"
        , filename: "alastfile"
      }
    ]);

    expect(blocks.length).to.equal(3);
  });
});
