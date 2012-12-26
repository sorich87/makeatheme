var View = require("views/base/view"),
    app = require("application");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown-submenu",
  template: "region_switch",
  collection: app.currentTheme.get("regions"),

  data: function () {
    var name = this.options.name,
        regions = this.collection.where({name: name});

    return {
      label: name === "header" ? "Header" : "Footer",
      regions: regions.map(function (region) {
        return {
          cid: region.cid,
          slug: region.get("slug"),
          active: region.get("slug") === this.currentRegion().get("slug")
        };
      }.bind(this))
    };
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
