// Tests for LoginView class.
var LoginView = require("views/login");

beforeEach(function () {
  this.loginView = new LoginView();
});

afterEach(function () {
  this.loginView.remove();
});

describe ("LoginView", function () {
  it ("will render the login modal", function () {
    this.loginView.render();
    expect(this.loginView.el.className).to.equal("modal");
    expect(this.loginView.el.innerHTML).to.contain("Please authenticate yourself");
  });
});
