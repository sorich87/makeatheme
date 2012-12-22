var View = require("views/base/view")
  , app = require("application",
    share_link = require("views/templates/share_link"));

module.exports = View.extend({
  id: "share-link",

  render: function () {
    this.$el.empty()
      .append(share_link({theme: app.currentTheme.id}))
      .appendTo($("#main", window.top.document));

    return this;
  }
});
