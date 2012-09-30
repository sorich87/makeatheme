var View = require("views/base/view")
  , app = require("application")
  , Template = require("models/template")
  , template = require("views/templates/templates");

module.exports = View.extend({
    id: "x-templates-select"
  , className: "x-section"
  , collection: app.editor.templates

  , events: {
      "change ul input": "switchTemplate"
    , "focus ul input": "switchTemplate"
    , "blur ul input": "switchTemplate"
    , "click .x-remove": "removeTemplate"
    , "click .x-new-template": "showForm"
    , "change .x-new-template-select select": "selectTemplate"
    , "click .x-new-template-add": "addTemplate"
  }

  , initialize: function (options) {
    _.bindAll(this, "addThemeAttributes", "makeMutable", "saveRegion");

    this.collection.on("add", this.addOne, this);
    this.collection.on("reset", this.addAll, this);
    this.collection.on("remove", this.removeOne, this);

    app.on("save:before", this.addThemeAttributes);
    app.on("mutations:started", this.makeMutable);
    app.on("region:load", this.saveRegion);
  }

  , render: function () {
    var standards = _.reject((new Template()).standards, function (standard) {
      return !!this.collection.getByName(standard.name);
    }.bind(this));

    this.$el.empty().append(template({
        standards: standards
      , edit: !app.editor.preview_only
    }));

    this.collection.reset(this.collection.models);

    this.loadTemplate(this.collection.getCurrent());

    return this;
  }

  , addOne: function (template) {
    var checked = ""
      , current = ""
      , remove = "";

    if (template.cid === this.collection.getCurrent().cid) {
      checked = " checked='checked'";
      current = " class='x-current'";
    }

    if (template.get("name") != "index") {
      remove = "<span class='x-remove' title='Delete template'>&times;</span>";
    }

    this.$("ul").append("<li" + current + "><label><input name='x-template'" + checked +
                        " type='radio' value='" + template.cid + "' />" +
                        template.label() + "</label>" + remove + "</li>");
  }

  , addAll: function () {
    this.$("ul").empty();

    _.each(this.collection.models, function (template) {
      this.addOne(template);
    }, this);
  }

  , removeOne: function (template) {
    this.$("input[value='" + template.cid + "']").closest("li").remove();
  }

  , switchTemplate: function () {
    var template = this.collection.getByCid(this.$("ul input:checked").val());

    this.$("ul li").removeClass("x-current");
    this.$("ul input:checked").closest("li").addClass("x-current");

    this.loadTemplate(template);
  }

  // Save current template, display it and trigger template:loaded event
  , loadTemplate: function (template) {
    var regions;

    app.trigger("template:load", template);

    regions = template.get("regions_attributes");

    build = regions.header.get("build") + template.get("build") + regions.footer.get("build");

    $("#page").fadeOut().empty().append(build).fadeIn();

    this.collection.setCurrent(template);

    app.trigger("template:loaded", template);
  }

  // Remove column if confirmed.
  , removeTemplate: function (e) {
    if (confirm("Are you sure you want to delete this template?")) {
      var cid = $(e.currentTarget).parent().find("input").val();
      this.collection.remove(cid);
    }
  }

  , showForm: function (e) {
    var $div = this.$(".x-new-template-select");

    if ($div.is(":hidden")) {
      $div.show("normal");
    } else {
      $div.hide("normal");
    }
  }

  , selectTemplate: function (e) {
    if ($(e.currentTarget).val() === "") {
      this.$(".x-new-template-name").show();
    } else {
      this.$(".x-new-template-name").hide();
    }
  }

  , addTemplate: function () {
    var name, attributes, template;

    name = this.$(".x-new-template-select select").val() ||
           this.$(".x-new-template-name").val();

    if (!name) {
      app.trigger("notification", "error", "Please, enter a template name.");
      return;
    }

    attributes = _.pick(this.collection.getByName("index").attributes,
                        "template", "build", "regions");
    attributes.name = name;

    template = new Template(attributes);
    this.collection.add(template);
    this.collection.setCurrent(template);
    this.render();

    app.trigger("notification", "success", "The new template was created. It's a copy of the default one.");
  }

  , addThemeAttributes: function (attributes) {
    attributes.templates = _.map(this.collection.models, function (template) {
      return _.pick(template.attributes, "_id", "name", "template");
    });
  }

  , makeMutable: function (pieces) {
    pieces.templates = this.collection;
  }

  , saveRegion: function (region) {
    this.collection.getCurrent().setRegion(region.get("name"), region.get("slug"));
  }
});
