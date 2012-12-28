var View = require("views/base/view")
  , template = require("views/templates/rename_theme_form")
  , Themes = require("collections/themes")
  , app = require("application");

module.exports = View.extend({
  events: {
    "submit form": "verifyName"
  },

  render: function () {
    this.$el.empty()
      .append(template({name: app.currentTheme.get("name")}))
      .appendTo($("#main", window.top.document));

    return this;
  },

  verifyName: function (e) {
    // Use window.top here because the modal is bound to the top window.
    var $element = window.top.$(e.currentTarget),
        $form = this.$("form"),
        name = this.$(".name").val();

    e.preventDefault();

    if (name) {
      $element.closest("#rename-theme-modal").modal("hide");

      app.currentTheme.set("name", name);

      app.trigger("notification", "success", "Theme name changed. Save to keep the change.");

      app.trigger("theme:renamed");

    } else if ($form.children(".alert-error").length === 0) {
      $form.prepend("<p class='alert alert-error'>" +
                    "Theme name can't be empty.</p>");
    }
  }
});

