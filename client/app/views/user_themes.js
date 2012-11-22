var View = require("views/base/view")
  , template = require("views/templates/user_themes")
  , app = require("application");

module.exports = View.extend({
  collection: app.currentUser.get("themes"),

  initialize: function () {
    app.on("theme:deleted", this.render.bind(this));
  },

  render: function () {
    var listView = app.createView("theme_list", {collection: this.collection});

    this.$el.empty()
      .append(template({count: this.collection.length}))
      .append(listView.render().$el);

    return this;
  }
});

