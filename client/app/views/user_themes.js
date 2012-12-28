var View = require("views/base/view")
  , template = require("views/templates/user_themes")
  , app = require("application");

module.exports = View.extend({
  collection: app.currentUser.get("themes"),

  appEvents: {
    "theme:deleted": "render"
  },

  render: function () {
    var listView = app.createView("theme_list", {collection: this.collection});

    this.subViews.push(listView);

    this.$el.empty()
      .append(template({count: this.collection.length}))
      .append(listView.render().$el);

    return this;
  }
});

