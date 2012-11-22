var View = require("views/base/view")
  , template = require("views/templates/themes")
  , Themes = require("collections/themes")
  , app = require("application");

module.exports = View.extend({
  collection: new Themes(app.data.themes),

  events: {
    "click #new-theme button": "createTheme"
  },

  render: function () {
    var listView = app.createView("theme_list", {collection: this.collection});

    this.$el.empty()
      .append(template())
      .append(listView.render().$el);

    return this;
  },

  createTheme: function (e) {
    var element = e.currentTarget;

    element.setAttribute("disabled", "true");
    element.innerHTML = "PLease wait...";

    $.ajax({
      type: "POST",
      url: "/themes/new",
      contentType: "application/json; charset=UTF-8",
      success: function (data) {
        var theme = JSON.parse(data);
        window.top.Backbone.history.navigate("/themes/" + theme._id, true);
      },
      error: function () {
        element.removeAttribute("disabled");

        app.trigger("notification", "error", "Unable to create a theme. " +
                    "Please try again.");
      }
    });
  }
});

