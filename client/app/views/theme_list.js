var View = require("views/base/view")
  , Themes = require("collections/themes")
  , template = require("views/templates/theme_list")
  , app = require("application");

module.exports = View.extend({
    el: $("<ul class='thumbnails'></ul>")

  , events: {
    "click .delete": "confirmDeletion"
  }

  , initialize: function () {
    this.collection.on("reset", this.addAll, this);
  }

  , render: function () {
    this.collection.reset(this.collection.models);

    return this;
  }

  , addOne: function (theme) {
    this.$el.append(template({
        id: theme.id
      , screenshot_uri: theme.get("screenshot_uri")
      , name: theme.get("name")
      , author: theme.get("author")
      , user_is_owner: theme.get("author_id") === app.currentUser.id
    }));
  }

  , addAll: function () {
    this.$el.empty();

    this.collection.each(function (theme) {
      this.addOne(theme);
    }, this);
  }

  , confirmDeletion: function (e) {
    var theme_id = e.currentTarget.getAttribute("data-theme-id"),
        theme = this.collection.get(theme_id),
        message = "Are you sure you want to delete '" +
          theme.get("name") + "'? There's no going back.";

    e.preventDefault();

    if (window.confirm(message)) {
      e.currentTarget.setAttribute("disabled");

      theme.destroy({
        success: function (model) {
          app.trigger("theme:deleted", model);

          app.trigger("notification", "success",
                      "'" + model.get("name") + "' has been deleted.");
        },

        error: function (model) {
          e.currentTarget.removeAttribute("disabled");

          app.trigger("notification", "error", "Error. Unable to delete '" +
                      model.get("name") + "'. Please try again.");
        }
      });
    }
  }
});
