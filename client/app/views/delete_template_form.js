var View = require("views/base/view")
  , template = require("views/templates/delete_template_form")
  , app = require("application");

module.exports = View.extend({
  collection: app.currentTheme.get("templates"),

  events: {
    "submit form": "deleteTemplate"
  },

  render: function () {
    var templates = [];

    this.collection.models.forEach(function (model) {
      if (model.get("name") !== "index") {
        templates.push(model.toJSON());
      }
    });

    this.$el.empty()
      .append(template({templates: templates}))
      .appendTo($("#main", window.top.document));

    return this;
  },

  deleteTemplate: function (e) {
    // Use window.top here because the modal is bound to the top window.
    var $element = window.top.$(e.currentTarget),
        id = this.$(".template-id").val();

    e.preventDefault();

    if (confirm("Are you sure you want to delete this template?")) {
      $element.closest("#delete-template-modal").modal("hide");

      this.collection.remove(id);

      this.$("option[value=" + id + "]").remove();

      app.trigger("notification", "success", "The template has been deleted.");

      app.trigger("template:deleted");
    }
  }
});

