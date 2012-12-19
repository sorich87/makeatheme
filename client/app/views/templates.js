var View = require("views/base/view")
  , app = require("application")
  , Template = require("models/template")
  , template = require("views/templates/templates");

module.exports = View.extend({
    id: "templates-select"
  , className: "x-section"
  , collection: app.editor.templates

  , events: {
      "change ul input": "switchTemplate"
    , "focus ul input": "switchTemplate"
    , "blur ul input": "switchTemplate"
    , "click .close": "removeTemplate"
    , "click .new-template": "showForm"
    , "change .new-template-select select": "selectTemplate"
    , "submit .new-template-select": "addTemplate"
  }

  , objectEvents: {
    collection: {
      "add": "addOne",
      "reset": "addAll",
      "remove": "removeOne"
    }
  }

  , appEvents: {
    "save:before": "addThemeAttributes",
    "mutations:started": "makeMutable",
    "region:load": "saveRegion"
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
      current = " class='current'";
    }

    if (template.get("name") != "index") {
      remove = "<span class='close' title='Delete template'>&times;</span>";
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
    var template = this.collection.get(this.$("ul input:checked").val());

    this.$("ul li").removeClass("current");
    this.$("ul input:checked").closest("li").addClass("current");

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
      this.render();
    }
  }

  , showForm: function (e) {
    var $div = this.$(".new-template-select");

    if ($div.is(":hidden")) {
      $div.show("normal");
    } else {
      $div.hide("normal");
    }
  }

  , selectTemplate: function (e) {
    if ($(e.currentTarget).val() === "") {
      this.$(".new-template-name").show().css("display", "block");
    } else {
      this.$(".new-template-name").hide();
    }
  }

  , addTemplate: function (e) {
    var name, attributes, template;

    e.preventDefault();

    name = this.$(".new-template-select select").val() ||
           this.$(".new-template-name").val();

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
