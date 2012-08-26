// Tests for ThemeView class.
var ThemeView = require("views/theme");

beforeEach(function () {
  this.themeView = new ThemeView({themeID: 9});
});

afterEach(function () {
  this.themeView.remove();
});

describe ("ThemeView", function () {
  it ("will render the editor iframe", function () {
    expect(this.themeView.render().el.innerHTML).to.be.contain('<iframe id="theme" name="theme" src="/editor/9" frameborder="0" width="100%" height="100%"></iframe>');
  });
});
