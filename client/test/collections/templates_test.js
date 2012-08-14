// Tests for Templates collection class.
var Templates = require("collections/templates");

describe ("Templates", function () {
  it ("will add Template instances as objects and arrays", function () {
    var templates = new Templates();

    expect(templates.length).to.equal(0);

    templates.add({
        name: "Some Template"
      , filename: "sometemplate"
    });

    expect(templates.length).to.equal(1);

    templates.add([
      {
          name: "Another Template"
        , filename: "anothertemplate"
        , current: true
      }
      , {
          name: "A Last Template"
        , filename: "alasttemplate"
      }
    ]);

    expect(templates.length).to.equal(3);
  });
});
