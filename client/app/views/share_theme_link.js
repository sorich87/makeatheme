var View = require("views/base/view")
  , app = require("application",
    template = require("views/templates/share_theme_link"));

module.exports = View.extend({
  id: "share-link",

  render: function () {
    this.$el.empty()
      .append(template({theme: app.currentTheme.id}))
      .appendTo($("#main", window.top.document));

    return this;
  }
});
