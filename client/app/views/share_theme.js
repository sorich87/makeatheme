var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/share_theme");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown",

  render: function () {
    var shareLinkView = app.createView("share_theme_link").render();

    this.subViews.push(shareLinkView);

    this.$el.empty().append(template());

    return this;
  }
});
