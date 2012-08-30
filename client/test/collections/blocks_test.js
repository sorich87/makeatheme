// Tests for Blocks collection class.
var Blocks = require("collections/blocks");

describe ("Blocks", function () {
  it ("will add Block instances as objects and arrays", function () {
    var blocks = new Blocks();

    expect(blocks.length).to.equal(0);

    blocks.add({
        label: "Some Block"
      , name: "somefile"
    });

    expect(blocks.length).to.equal(1);

    blocks.add([
      {
          label: "Another Block"
        , name: "anotherfile"
      }
      , {
          label: "A Last Block"
        , name: "alastfile"
      }
    ]);

    expect(blocks.length).to.equal(3);
  });
});
