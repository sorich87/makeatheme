var View = require("views/base/view")
  , template = require("views/templates/regions")
  , app = require("application")
  , Region = require("models/region");

module.exports = View.extend({
    id: "x-region-select"
  , className: "x-section"
  , collection: app.regions

  , events: {
      "change .x-header-select, .x-footer-select": "switchRegion"
    , "click .x-header-new button, .x-footer-new button": "addRegion"
  }

  , initialize: function () {
    this.template = app.templates.getCurrent();

    this.collection.on("add", this.addOne, this);
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
    var name = region.get("name")
      , slug = region.get("slug");

    app.trigger("regionLoad", region);

    this.template.setRegion(name, slug);

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
});
