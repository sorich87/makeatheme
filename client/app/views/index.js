var app = require("application")
  , View = require("views/base/view")
  , template = require("views/templates/faq");

module.exports = View.extend({
    id: "#themes-list"

  , events: {
    "click [href='#faq']": "preventDefault"
  }

  , initialize: function () {
    this.collapseFaq();
  }

  , render: function () {
    this.$el
      .append(template())
      .append(app.themeListView.render().$el);

    return this;
  }

  // Show FAQ collapsed by default
  , collapseFaq: function () {
    $("#faq").collapse();
  }

  , preventDefault: function (e) {
    e.preventDefault();
  }
});
