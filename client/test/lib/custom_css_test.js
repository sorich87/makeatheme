var CustomCSS = require("lib/custom_css");

beforeEach(function () {
  this.customCSS = new CustomCSS;
});

describe("CustomCSS", function () {
  it("will add a style node", function () {
    expect(window.document.head.children).to.contain(this.customCSS.node);
  });

  it("will insert a rule", function () {
    this.customCSS.insertRule(".sometest", "color", "#000");

    expect(this.customCSS.sheet.cssRules[0].style.color).to.equal("#000");
  });

  it("will get a rule", function () {
    this.customCSS.insertRule(".sometest", "color", "#000");

    expect(this.customCSS.getRule(".sometest", "color")).to.equal("#000");
  });

  it("will delete a rule", function () {
    this.customCSS.insertRule(".sometest", "color", "#000");
    this.customCSS.deleteRule(".sometest", "color");

    expect(this.customCSS.getRule(".sometest", "color")).to.not.equal("#000");
    expect(this.customCSS.sheet.cssRules.length).to.equal(0);
  });
});
