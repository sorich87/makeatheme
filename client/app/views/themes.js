var View = require("views/base/view")
  , template = require("views/templates/themes")
  , Themes = require("collections/themes")
  , app = require("application");

module.exports = View.extend({
  collection: new Themes(app.data.themes),

  events: {
    "submit #new-theme": "createTheme"
  },

  render: function () {
    var listView = app.createView("theme_list", {collection: this.collection});

    this.subViews.push(listView);

    this.$el.empty()
      .append(template())
      .append(listView.render().$el);

    return this;
  },

  createTheme: function (e) {
    var data = {name: this.$("input[name=theme_name]").val()};
    console.log(data);

    e.preventDefault();

    // Set timeout so that button is disabled after all script are run
    // to avoid blocking event bubbling
    setTimeout(function () {
      this.$("button").attr("disabled", "true").html("Please wait...");
    }, 0);

    $.ajax({
      type: "POST",
      url: "/themes",
      contentType: "application/json; charset=UTF-8",
      data: JSON.stringify(data),
      success: function (data) {
        var theme = JSON.parse(data);

        app.trigger("theme:created", theme);

        Backbone.history.navigate("/themes/" + theme._id, true);
      },
      error: function () {
        this.$("button").removeAttr("disabled").html("Create Theme");

        app.trigger("notification", "error", "Unable to create a theme. " +
                    "Please try again.");
      }.bind(this)
    });
  }
});

