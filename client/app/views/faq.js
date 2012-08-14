var View = require("views/base/view")
  , template = require("views/templates/faq");

module.exports = View.extend({
  render: function () {
    this.setElement(template());

    return this;
  }
});
