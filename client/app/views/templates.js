var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    el: $("<div id='x-templates-select'><h4><label>Current Template</label></h4>\
          <p>Click to change</p>\
          <ul></ul></div>")

  , collection: app.templates

  , events: {
      "change": "switchTemplate"
    , "focus ul input": "highlightSelection"
    , "blur ul input": "highlightSelection"
    , "change ul input": "highlightSelection"
    , "click .x-remove": "removeTemplate"
  }

  , initialize: function (options) {
    this.collection.on("add", this.addOne, this);
    this.collection.on("reset", this.addAll, this);
    this.collection.on("remove", this.removeOne, this);
  }

  , render: function () {
    this.collection.reset(this.collection.models);

    // Load index template
    this.loadTemplate(this.collection.getByName("index"));

    return this;
  }

  , addOne: function (template) {
    var checked = current = "";

    if (template.get("name") === "index") {
      checked = " checked='checked'";
      current = " class='x-current'";
    }

    this.$("ul").append("<li" + current + "><label><input name='x-template'" + checked
                        + " type='radio' value='" + template.cid + "' />"
                        + template.label() + "</label><span class='x-remove' title='Delete template'>&times;</span></li>");
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

    this.loadTemplate(template);
  }

  // Save current template, display it and trigger templateLoaded event
  , loadTemplate: function (template) {
    var header, footer;

    app.trigger("templateLoad", template);

    header = app.regions.getByName("header");
    footer = app.regions.getByName("footer");

    build = header.get("build") + template.get("build") + footer.get("build");

    $("#page").empty().append(build);

    this.collection.setCurrent(template);

    app.trigger("templateLoaded", template);
  }

  , highlightSelection: function () {
    this.$("ul li").removeClass("x-current");
    this.$("ul input:checked").closest("li").addClass("x-current");
  }

  // Remove column if confirmed.
  , removeTemplate: function (e) {
    if (confirm("Are you sure you want to delete this template?")) {
      var cid = $(e.currentTarget).parent().find("input").val();
      this.collection.remove(cid);
    }
  }
});
