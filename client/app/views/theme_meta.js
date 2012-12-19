var View = require("views/base/view")
  , template = require("views/templates/theme_meta")
  , Themes = require("collections/themes")
  , app = require("application");

module.exports = View.extend({
  id: "theme-meta",

  appEvents: {
    "save:before": "saveThemeName"
  },

  render: function () {
    this.$el.empty()
      .append(template({name: app.data.theme.name}));

    if (app.data.theme.author_id === app.currentUser.id) {
      this.$(".name").attr("contenteditable", "true");
    }

    return this;
  },

  saveThemeName: function (attributes) {
    attributes.name = this.$(".name").text();
  }
});

