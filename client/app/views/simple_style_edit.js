var View = require("views/base/view")
  , app = require("application")
  , template = require("views/templates/simple_style_edit");

module.exports = View.extend({
  render: function () {
    this.el.innerHTML = template();

    return this;
  }
});
