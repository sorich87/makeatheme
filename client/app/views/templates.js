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
  }

  , initialize: function (options) {
    this.collection.on("add", this.addOne, this);
    this.collection.on("reset", this.addAll, this);
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
      current = " class='current'";
    }

    this.$("ul").append("<li" + current + "><label><input name='x-template'" + checked
                        + " type='radio' value='" + template.cid + "' />"
                        + template.label() + "</label></li>");
  }

  , addAll: function () {
    this.$("ul").empty();

    _.each(this.collection.models, function (template) {
      this.addOne(template);
    }, this);
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
    this.$("ul li").removeClass("current");
    this.$("ul input:checked").parents("li").addClass("current");
  }
});
