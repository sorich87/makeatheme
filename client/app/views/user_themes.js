var View = require("views/base/view")
  , template = require("views/templates/user_themes")
  , app = require("application");

module.exports = View.extend({
  collection: app.currentUser.get("themes"),

  initialize: function () {
    this.listView = app.createView("theme_list", {collection: this.collection});

    app.on("theme:deleted", this.render.bind(this));
  },

  render: function () {
    this.$el.empty()
      .append(template({count: this.collection.length}))
      .append(this.listView.render().$el);

    return this;
  }
});

