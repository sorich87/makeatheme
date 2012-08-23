// Tests for FaqView class.
var FaqView = require("views/faq");

beforeEach(function () {
  this.faqView = new FaqView();
});

afterEach(function () {
  this.faqView.remove();
});

describe ("FaqView", function () {
  it ("will render the FAQ", function () {
    expect(this.faqView.render().el.innerHTML).to.contain("Frequently Asked Questions");
  });
});
