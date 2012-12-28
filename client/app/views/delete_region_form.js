var View = require("views/base/view")
  , template = require("views/templates/delete_region_form")
  , app = require("application");

module.exports = View.extend({
  collection: app.currentTheme.get("regions"),

  events: {
    "submit form": "deleteRegion"
  },

  appEvents: {
    "region:created": "render"
  },

  render: function () {
    var regions = [],
        name = this.options.name;

    this.collection.where({name: name}).forEach(function (model) {
      if (model.get("slug") !== "default") {
        regions.push({
          cid: model.cid,
          slug: model.get("slug")
        });
      }
    });

    this.$el.empty()
      .append(template({
        name: name,
        label: name === "header" ? "Header": "Footer",
        regions: regions
      }))
      .appendTo($("#main", window.top.document));

    return this;
  },

  deleteRegion: function (e) {
    // Use window.top here because the modal is bound to the top window.
    var name = this.options.name,
        $element = window.top.$(e.currentTarget),
        cid = this.$(".region-cid").val();

    e.preventDefault();

    if (confirm("Are you sure you want to delete this " + name + "?")) {
      $element.closest("#delete-" + name + "-region-modal").modal("hide");

      app.currentTheme.get("templates").getCurrent()
        .setRegion(name, "default");

      this.collection.remove(cid);

      this.render();

      app.trigger("notification", "success", "The template has been deleted.");

      app.trigger("region:deleted");
    }
  }
});

