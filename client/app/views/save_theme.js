var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/save_theme");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown",
  model: app.currentTheme,

  events: {
    "click #save-theme": "saveTheme"
  },

  render: function () {
    this.$el.empty().append(template());

    return this;
  },

  saveTheme: function (e) {
    e.preventDefault();

    this.model.save(null, {
      success: function (theme) {
        app.trigger("save:after", theme);

        app.trigger("notification", "success", "Theme saved.");
      },
      error: function (theme, response) {
        app.trigger("save:error");

        app.trigger("notification", "error", "Unable to save the theme. Please try again.");
      }
    });
  }
});
