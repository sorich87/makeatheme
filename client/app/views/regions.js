var View = require("views/base/view")
  , template = require("views/templates/regions")
  , app = require("application")
  , Region = require("models/region");

module.exports = View.extend({
    id: "x-region-select"
  , className: "x-section"
  , collection: app.regions

  , events: {
      "change .x-header-select, .x-footer-select": "showForm"
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

  , showForm: function (e) {
    var region, $form;

    if (e.target.className.indexOf("header") != -1) {
      region = "header";
    } else {
      region = "footer";
    }

    if ($(e.target).val() === "") {
      this.$(".x-" + region + "-new").show("slow");
    } else {
      this.$(".x-" + region + "-new").hide("slow");
    }
  }

  , addRegion: function (e) {
    var name, slug, region;

    if (e.currentTarget.className.indexOf("header") != -1) {
      name = "header";
    } else {
      name = "footer";
    }

    slug = this.$(".x-" + name + "-new input").val();

    if (!slug) {
      app.trigger("notification", "error", "Please, enter a " + name + " name.");
      return;
    }

    attributes = _.pick(this.collection.getByName(name).attributes, "name", "template", "build");
    attributes.slug = slug;

    region = new Region(attributes);
    this.collection.add(region);
    this.template.setRegion(name, slug);

    $("#page").children(name)[0].outerHTML = attributes.build;

    $(e.currentTarget).parent().hide("slow");

    app.trigger("notification", "success", "The new " + name + " was created.");
  }

  , addOne: function (region) {
    var slug;

    app.trigger("regionLoad", region);

    slug = region.get("slug");

    this.$(".x-" + region.get("name") + "-select")
      .children(":selected").removeAttr("selected").end()
      .children("[value='']")
        .before("<option value='" + slug + "' selected='selected'>" + slug + "</option>");

    app.trigger("regionLoaded", region);
  }
});
