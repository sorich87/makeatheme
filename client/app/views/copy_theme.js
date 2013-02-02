var app = require("application"),
    View = require("views/base/view"),
    template = require("views/templates/copy_theme");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown",
  model: app.currentTheme,

  events: {
    "click #copy-theme": "copyTheme"
  }

  , render: function () {
    this.$el.empty()
      .append(template({theme_id: this.model.id}));

    return this;
  }

  , copyTheme: function (e) {
    if (this.copying === true) {
      return;
    }

    var element = e.currentTarget;

    this.copying = true;

    e.preventDefault();

    element.innerHTML = "Copying the theme &hellip;";

    $.ajax({
      type: "POST",
      url: "/themes/fork",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify({id: this.model.id}),
      success: function (data) {
        var theme = JSON.parse(data);

        this.copying = false;

        window.top.Application.trigger("theme:copied", theme);

        app.trigger("notification", "success", "The theme has been copied. " +
                    "Now start editing.");

        window.top.Backbone.history.navigate("/themes/" + theme._id, true);
      }.bind(this),
      error: function () {
        this.copying = false;

        element.innerHTML = "Copy Theme";

        app.trigger("notification", "error", "Error. Unable to copy theme. " +
                    "Please reload the page and try again.");
      }.bind(this)
    });
  }
});
