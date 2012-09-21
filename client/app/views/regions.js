var View = require("views/base/view")
  , template = require("views/templates/regions")
  , app = require("application")
  , Region = require("models/region")
  , Regions = require("collections/regions");

module.exports = View.extend({
    id: "x-region-select"
  , className: "x-section"
  , collection: new Regions(app.data.theme_pieces.regions)

  , events: {
      "change .x-header-select, .x-footer-select": "switchRegion"
    , "click .x-header-new button, .x-footer-new button": "addRegion"
  }

  , initialize: function () {
    _.bindAll(this, "buildDownload", "makeMutable", "addRegionsToTemplate");

    this.collection.on("add", this.addOne, this);

    app.on("download:before", this.buildDownload);
    app.on("mutations:started", this.makeMutable);
    app.on("templateLoad", this.addRegionsToTemplate);
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

    this.toggleForm(name, slug);

    if (slug) {
      this.loadRegion(this.collection.getByName(name, slug));
    }
  }

  , toggleForm: function (name, slug) {
    if (slug) {
      this.$(".x-" + name + "-new").hide("slow");
    } else {
      this.$(".x-" + name + "-new").show("slow");
    }
  }

  , loadRegion: function (region) {
    var name = region.get("name");

    app.trigger("regionLoad", region);

    $("#page").children(name)[0].outerHTML = region.get("build");
    $("#page").children(name).fadeOut().fadeIn();

    app.trigger("regionLoaded", region);
  }

  , addRegion: function (e) {
    var name, slug, region, $element;

    if (e.currentTarget.className.indexOf("header") != -1) {
      name = "header";
    } else {
      name = "footer";
    }

    slug = _.str.slugify(this.$(".x-" + name + "-new input").val());

    if (!slug) {
      app.trigger("notification", "error", "Please, enter a " + name + " name.");
      return;
    }

    attributes = _.pick(this.collection.getByName(name).attributes, "name", "template", "build");
    attributes.slug = slug;

    region = new Region(attributes);
    this.collection.add(region);
    this.loadRegion(region);

    $(e.currentTarget).parent().hide("slow");

    app.trigger("notification", "success", "The new " + name + " was created. It's a copy of the default one.");
  }

  , addOne: function (region) {
    var slug;

    slug = region.get("slug");

    this.$(".x-" + region.get("name") + "-select")
      .children(":selected").removeAttr("selected").end()
      .children("[value='']")
        .before("<option value='" + slug + "' selected='selected'>" + slug + "</option>");
  }

  , buildDownload: function (attributes) {
    attributes.regions = _.map(this.collection.models, function (region) {
      return _.pick(region.attributes, "_id", "name", "slug", "template");
    });
  }

  , makeMutable: function (pieces) {
    pieces.regions = this.collection;
  }

  , addRegionsToTemplate: function (template) {
    var regions = template.get("regions");

    template.set("regions_attributes", {
        header: this.collection.getByName("header", regions.header)
      , footer: this.collection.getByName("footer", regions.footer)
    });
  }
});
