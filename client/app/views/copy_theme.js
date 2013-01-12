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
    var element = e.currentTarget;

    e.preventDefault();

    // Set timeout so that button is disabled after all script are run
    // to avoid blocking event bubbling
    setTimeout(function () {
      element.setAttribute("disabled", "true");
      element.innerHTML = "Started the Photocopier";
    }, 0);

    $.ajax({
      type: "POST",
      url: "/themes",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify({id: this.model.id}),
      success: function (data) {
        var theme = JSON.parse(data);

        window.top.Application.trigger("theme:copied", theme);

        app.trigger("notification", "success", "The theme has been copied. " +
                    "Now start editing.");

        window.top.Backbone.history.navigate("/themes/" + theme._id, true);
      },
      error: function () {
        element.removeAttribute("disabled");
        element.innerHTML = "Copy Theme";

        app.trigger("notification", "error", "Error. Unable to copy theme. " +
                    "Please reload the page and try again.");
      }
    });
  }
});
