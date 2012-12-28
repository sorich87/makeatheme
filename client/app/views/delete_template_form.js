var View = require("views/base/view")
  , template = require("views/templates/delete_template_form")
  , app = require("application");

module.exports = View.extend({
  collection: app.currentTheme.get("templates"),

  events: {
    "submit form": "deleteTemplate"
  },

  appEvents: {
    "template:created": "render"
  },

  render: function () {
    var templates = [];

    this.collection.models.forEach(function (model) {
      if (model.get("name") !== "index") {
        templates.push({
          cid: model.cid,
          name: model.get("name")
        });
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
        cid = this.$(".template-cid").val();

    e.preventDefault();

    if (confirm("Are you sure you want to delete this template?")) {
      $element.closest("#delete-template-modal").modal("hide");

      this.collection.remove(cid);

      this.render();

      app.trigger("notification", "success", "The template has been deleted.");

      app.trigger("template:deleted");
    }
  }
});

