var View = require("views/base/view")
  , template = require("views/templates/new_template_form")
  , app = require("application");

module.exports = View.extend({
  collection: app.currentTheme.get("templates"),

  events: {
    "submit form": "addTemplate"
  },

  render: function () {
    this.$el.empty()
      .append(template())
      .appendTo($("#main", window.top.document));

    return this;
  },

  addTemplate: function (e) {
    // Use window.top here because the modal is bound to the top window.
    var $element = window.top.$(e.currentTarget),
        $form = this.$("form"),
        name = this.$(".name").val();

    e.preventDefault();

    if (name) {
      var attributes = _.pick(this.collection.getByName("index").attributes,
                          "template", "build", "regions");
      attributes.name = name;

      $element.closest("#template-form-modal").modal("hide");

      this.collection.add(attributes);
      this.collection.setCurrent(attributes);

      app.trigger("notification", "success", "The new template was created. " +
                  "It's a copy of the default one.");

      app.trigger("template:created");

    } else if ($form.children(".alert-error").length === 0) {
      $form.prepend("<p class='alert alert-error'>" +
                    "Template name can't be empty.</p>");
    }
  }
});

