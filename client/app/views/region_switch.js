var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/region_switch");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown-submenu",
  collection: app.currentTheme.get("regions"),

  render: function () {
    var name = this.options.name,
        currentRegion = this.currentRegion(),
        label = name === "header" ? "Header" : "Footer",
        regions;

    regions = this.collection.where({name: name});
    regions = regions.map(function (region) {
      return {
        cid: region.cid,
        slug: region.get("slug"),
        active: region.get("slug") === currentRegion.get("slug")
      };
    });

    this.$el.empty().append(template({
      label: label,
      regions: regions
    }));

    return this;
  },

  events: {
    "click .dropdown-menu a": "switchRegion"
  },

  appEvents: {
    "region:created": "render",
    "region:deleted": "render"
  },

  initialize: function () {
    View.prototype.initialize.call(this);
  },

  currentRegion: function () {
    var name = this.options.name,
        currentTemplate = app.currentTheme.get("templates").getCurrent(),
        templateRegions = currentTemplate.get("regions");

    return this.collection.getByName(name, templateRegions[name]);
  },

  switchRegion: function (e) {
    var cid = e.currentTarget.getAttribute("data-cid"),
        slug = this.collection.get(cid).get("slug");

    e.preventDefault();

    this.$(".active").removeClass("active");
    $(e.currentTarget.parentNode).addClass("active");

    app.currentTheme.get("templates").getCurrent()
      .setRegion(this.options.name, slug);

    app.trigger("region:loaded");
  }
});
