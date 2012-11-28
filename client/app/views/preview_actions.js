var app = require("application")
  , View = require("views/base/view")
  , data = require("lib/editor_data")
  , mutations = require("lib/mutations")
  , accordion_group = require("views/templates/accordion_group")
  , copy_button = require("views/templates/copy_button");

module.exports = View.extend({
  id: "layout-editor"

  , events: {
    "click #copy-theme": "copyTheme"
  }

  , render: function () {
    this.$el.empty()
      .append(app.createView("templates_select").render().$el)
      .append(copy_button({theme_id: app.data.theme._id}));

    return this;
  }

  , copyTheme: function (e) {
    var element = e.currentTarget;

    // Set timeout so that button is disabled after all script are run
    // to avoid blocking event bubbling
    setTimeout(function () {
      element.setAttribute("disabled", "true");
      element.innerHTML = "Started the Photocopier";
    }, 0);

    $.ajax({
      type: "POST",
      url: "/themes/fork",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify({id: app.data.theme._id}),
      success: function (data) {
        var theme = JSON.parse(data);

        window.top.Application.trigger("theme:copied", theme);

        window.top.Backbone.history.navigate("/themes/" + theme._id, true);
      },
      error: function () {
        element.removeAttribute("disabled");

        app.trigger("notification", "error", "Error. Unable to copy theme. " +
                    "Please reload the page and try again.");
      }
    });
  }
});
