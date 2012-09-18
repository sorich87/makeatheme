var View = require("views/base/view")
  , template = require("views/templates/style_edit")
  , CustomCSS = require("lib/custom_css");

module.exports = View.extend({
    id: "x-style-edit"
  , className: "x-section"

  , render: function () {
    this.$el.html(template());

    return this;
  }
});
