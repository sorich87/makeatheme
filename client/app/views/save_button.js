var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    id: "x-save-button"

  , events: {
    "click button.x-save": "save"
  }

  , render: function () {
    var button;

    if (app.currentUser.id) {
      button = "<button class='btn btn-primary x-save'>Save Theme</button>";
    }

    this.$el.empty().append(button);

    return this;
  }

  , save: function (e) {
    var attrs = _.clone(app.data.theme);

    if (app.editor.fork) {
      attrs.parent_id = attrs._id;
      attrs._id = null;
    }

    e.target.setAttribute("disabled", "true");

    app.trigger("save:before", attrs);

    app.currentUser.get("themes").create(attrs, {
      success: function (theme) {
        app.trigger("save:after", theme);

        e.target.removeAttribute("disabled");

        app.trigger("notification", "success", "Theme saved.");

        window.top.Backbone.history.navigate("/themes/" + theme.id + "/edit", true);
      }
      , error: function (theme, response) {
        app.trigger("save:error");

        e.target.removeAttribute("disabled");

        app.trigger("notification", "error", "Unable to save the theme. Please try again.");
      }
    });
  }
});
