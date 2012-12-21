var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/templates"),
    Templates = require("collections/templates");

module.exports = View.extend({
  id: "templates-select",
  tagName: "li",
  className: "dropdown-submenu",

  template: "templates_select",
  collection: app.currentTheme.get("templates"),

  data: function () {
    return {
      templates: this.collection.map(function (template) {
        return {
          id: template.id,
          label: template.label(),
          active: template.get("name") === "index"
        };
      })
    };
  },

  events: {
    "click .dropdown-menu a": "switchTemplate"
  },

  initialize: function () {
    var template = this.collection.getCurrent();

    $("#page").fadeOut().empty()
      .append(template.get("full"))
      .fadeIn();

    View.prototype.initialize.call(this);
  },

  switchTemplate: function (e) {
    var id = e.currentTarget.getAttribute("data-id"),
        template = this.collection.get(id);

    e.preventDefault();

    $("#page").fadeOut().empty()
      .append(template.get("full"))
      .fadeIn();

    this.$(".active").removeClass("active");
    $(e.currentTarget.parentNode).addClass("active");
  }
});
