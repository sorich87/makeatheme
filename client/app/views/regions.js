var View = require("views/base/view")
  , template = require("views/templates/regions")
  , app = require("application")
  , Region = require("models/region");

module.exports = View.extend({
    id: "x-region-select"
  , className: "x-section"
  , collection: app.currentTheme.get("regions")

  , events: {
    "change .x-header-select, .x-footer-select": "switchRegion"
  }

  , appEvents: {
    "region:created": "render"
  }

  , objectEvents: {
    collection: {
      "add": "addOne"
    }
  }

  , render: function () {
    this.$el.empty().append(template({
        headers: this.collection.where({name: "header"}).map(function (header) { return header.attributes; })
      , footers: this.collection.where({name: "footer"}).map(function (footer) { return footer.attributes; })
    }));

    this.$(".x-header-new, .x-footer-new").hide();

    return this;
  }

  , switchRegion: function (e) {
    var name, slug, region;

    if (e.target.className.indexOf("header") != -1) {
      name = "header";
    } else {
      name = "footer";
    }

    slug = $(e.target).val();

    if (slug) {
      this.loadRegion(this.collection.getByName(name, slug));
    }
  }

  , loadRegion: function (region) {
    var name = region.get("name");

    app.currentTheme.get("templates").getCurrent()
      .setRegion(region.get("name"), region.get("slug"));

    $("#page").children(name)[0].outerHTML = region.get("build");
    $("#page").children(name).fadeOut().fadeIn();

    app.trigger("region:loaded", region);
  }

  , addOne: function (region) {
    var slug;

    slug = region.get("slug");

    this.$(".x-" + region.get("name") + "-select")
      .children(":selected").removeAttr("selected").end()
      .children("[value='']")
        .before("<option value='" + slug + "' selected='selected'>" + slug + "</option>");
  }
});
