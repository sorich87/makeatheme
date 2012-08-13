var View = require("views/base/view")
  , template = require("views/templates/style_edit");

module.exports = View.extend({
    el: $("<div id='x-style-edit'></div>")

  , render: function () {
    this.$el.html(template());

    return this;
  }
});
