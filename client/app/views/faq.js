var View = require("views/base/view")
  , template = require("views/templates/faq");

module.exports = View.extend({
  events: {
    "click [href='#faq']": "preventDefault"
  }

  , initialize: function () {
    // Show FAQ collapsed by default
    $("#faq").collapse();
  }

  , render: function () {
    this.setElement(template());

    return this;
  }

  , preventDefault: function (e) {
    e.preventDefault();
  }
});
