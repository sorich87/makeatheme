var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/templates"),
    Templates = require("collections/templates");

module.exports = View.extend({
  id: "templates-select",
  tagName: "li",
  className: "dropdown-submenu",
  template: "template_switch",
  collection: app.currentTheme.get("templates"),

  data: function () {
    var currentTemplate = this.collection.getCurrent();

    return {
      templates: this.collection.map(function (template) {
        return {
          id: template.id,
          label: template.label(),
          active: template.get("name") === currentTemplate.get("name")
        };
      })
    };
  },

  events: {
    "click .dropdown-menu a": "switchTemplate"
  },

  appEvents: {
    "template:created": "render"
  },

  initialize: function () {
    this.loadTemplate(this.collection.getCurrent());

    View.prototype.initialize.call(this);
  },

  switchTemplate: function (e) {
    var id = e.currentTarget.getAttribute("data-id");

    e.preventDefault();

    this.loadTemplate(this.collection.get(id));

    this.$(".active").removeClass("active");
    $(e.currentTarget.parentNode).addClass("active");
  }

  // Save current template, display it and trigger template:loaded event
  , loadTemplate: function (template) {
    var regions = app.currentTheme.get("regions"),
        templateRegions = template.get("regions"),
        header = regions.getByName("header", templateRegions.header),
        footer = regions.getByName("footer", templateRegions.footer),
        build = header.get("build") + template.get("build") + footer.get("build");

    $("#page").fadeOut().empty().append(build).fadeIn();

    this.collection.setCurrent(template);

    app.trigger("template:loaded", template);
  }
});
