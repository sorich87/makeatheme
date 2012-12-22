var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/save_theme");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown",

  events: {
    "click #save-theme": "saveTheme"
  },

  render: function () {
    this.$el.empty().append(template());

    return this;
  },

  saveTheme: function (e) {
    var attrs = _.clone(app.data.theme);

    app.trigger("save:before", attrs);

    app.currentUser.get("themes").create(attrs, {
      success: function (theme) {
        app.trigger("save:after", theme);

        app.trigger("notification", "success", "Theme saved.");
      }
      , error: function (theme, response) {
        app.trigger("save:error");

        app.trigger("notification", "error", "Unable to save the theme. Please try again.");
      }
    });
  }
});
