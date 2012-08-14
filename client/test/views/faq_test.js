// Tests for FaqView class.
var FaqView = require("views/faq");

describe ("FaqView", function () {
  it ("will render the FAQ", function () {
    expect((new FaqView).render().el.innerHTML).to.contain("Frequently Asked Questions");
  });
});
