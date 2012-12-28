var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/template_switch");

module.exports = View.extend({
  id: "templates-select",
  tagName: "li",
  className: "dropdown-submenu",
  collection: app.currentTheme.get("templates"),

  events: {
    "click .dropdown-menu a": "switchTemplate"
  },

  appEvents: {
    "region:created": "render",
    "region:deleted": "render",
    "region:loaded": "render",
    "template:created": "render",
    "template:deleted": "render"
  },

  render: function () {
    var currentTemplate = this.collection.getCurrent(),
        templates;

    templates = this.collection.map(function (template) {
      return {
        cid: template.cid,
        label: template.get("name"),
        active: template.get("name") === currentTemplate.get("name")
      };
    });

    this.$el.empty().append(template({templates: templates}));

    this.loadCurrentTemplate();

    return this;
  },

  switchTemplate: function (e) {
    var cid = e.currentTarget.getAttribute("data-cid"),
        template = this.collection.get(cid);

    e.preventDefault();

    this.collection.setCurrent(template);
    this.loadTemplate(template);

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

    app.trigger("template:loaded", template);
  }

  , loadCurrentTemplate: function () {
    this.loadTemplate(this.collection.getCurrent());
  }
});
