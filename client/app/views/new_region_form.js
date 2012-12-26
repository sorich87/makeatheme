var View = require("views/base/view")
  , template = require("views/templates/new_region_form")
  , app = require("application");

module.exports = View.extend({
  collection: app.currentTheme.get("regions"),

  events: {
    "submit form": "addRegion"
  },

  render: function () {
    var name = this.options.name;

    this.$el.empty()
      .append(template({
        name: name,
        label: name === "header" ? "Header" : "Footer"
      }))
      .appendTo($("#main", window.top.document));

    return this;
  },

  addRegion: function (e) {
    // Use window.top here because the modal is bound to the top window.
    var $element = window.top.$(e.currentTarget),
        $form = this.$("form"),
        name = this.options.name,
        slug = this.$(".slug").val();

    e.preventDefault();

    if (slug) {
      var attributes = _.pick(this.collection.getByName(name).attributes,
                          "name", "template", "build");

      attributes.slug = slug;

      $element.closest("#" + name + "-region-form-modal").modal("hide");

      this.collection.add(attributes);

      app.trigger("notification", "success", "The new " + name +
                  " was created. It's a copy of the default one.");

      app.trigger("region:created");

    } else if ($form.children(".alert-error").length === 0) {
      $form.prepend("<p class='alert alert-error'>" +
                    "Please, enter a " + name + " name.</p>");
    }
  }
});

