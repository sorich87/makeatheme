// Tests for Templates collection class.
var Templates = require("collections/templates");

describe ("Templates", function () {
  it ("will add Template instances as objects and arrays", function () {
    var templates = new Templates();

    expect(templates.length).to.equal(0);

    templates.add({
        label: "Some Template"
      , name: "sometemplate"
    });

    expect(templates.length).to.equal(1);

    templates.add([
      {
          label: "Another Template"
        , name: "anothertemplate"
        , current: true
      }
      , {
          label: "A Last Template"
        , name: "alasttemplate"
      }
    ]);

    expect(templates.length).to.equal(3);
  });
});
