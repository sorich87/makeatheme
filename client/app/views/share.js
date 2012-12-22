var View = require("views/base/view"),
    app = require("application"),
    share = require("views/templates/share");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown",

  render: function () {
    var shareLinkView = app.createView("share_link").render();

    this.subViews.push(shareLinkView);

    this.$el.empty().append(share());

    return this;
  }
});
