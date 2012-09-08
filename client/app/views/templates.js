var View = require("views/base/view")
  , app = require("application")
  , Template = require("models/template")
  , template = require("views/templates/templates");

module.exports = View.extend({
    id: "x-templates-select"

  , collection: app.templates

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
    this.collection.on("add", this.addOne, this);
    this.collection.on("reset", this.addAll, this);
    this.collection.on("remove", this.removeOne, this);
  }

  , render: function () {
    var standards = _.reject((new Template).standards, function (standard) {
      return !!this.collection.getByName(standard.name);
    }.bind(this));

    this.$el.empty().append(template({standards: standards}));

    this.collection.reset(this.collection.models);

    // Load index template
    this.loadTemplate(this.collection.getCurrent());

    return this;
  }

  , addOne: function (template) {
    var checked = current = remove = "";

    if (template.cid === this.collection.getCurrent().cid) {
      checked = " checked='checked'";
      current = " class='x-current'";
    }

    if (template.get("name") != "index") {
      remove = "<span class='x-remove' title='Delete template'>&times;</span>";
    }

    this.$("ul").append("<li" + current + "><label><input name='x-template'" + checked
                        + " type='radio' value='" + template.cid + "' />"
                        + template.label() + "</label>" + remove + "</li>");
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

  // Save current template, display it and trigger templateLoaded event
  , loadTemplate: function (template) {
    var header, footer;

    app.trigger("templateLoad", template);

    header = app.regions.getByName("header");
    footer = app.regions.getByName("footer");

    build = header.get("build") + template.get("build") + footer.get("build");

    $("#page").fadeOut().empty().append(build).fadeIn();

    this.collection.setCurrent(template);

    app.trigger("templateLoaded", template);
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
    var name, label, attributes, selection, template;

    attributes = this.collection.getByName("index").attributes;
    attributes = {
        template: attributes.template
      , build: attributes.build
    };

    if (selection = this.$(".x-new-template-select select").val()) {
      attributes.name = selection;
    } else {
      attributes.label = this.$(".x-new-template-name").val();
      attributes.name = attributes.label.toLowerCase().replace(/[^0-9A-Za-z]/, "-");
    }

    if (!attributes.name) {
      app.trigger("notification", "error", "Please, enter a template name.");
      return;
    }

    template = new Template(attributes);
    this.collection.add(template);
    this.collection.setCurrent(template);
    this.render();

    app.trigger("notification", "success", "The new template was created.");
  }
});
