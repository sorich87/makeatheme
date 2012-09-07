var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    el: $("<div id='x-templates-select'><h4><label>Current Template</label></h4>\
          <form><select></select></form></div>")

  , collection: app.templates

  , events: {
    "change": "switchTemplate"
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
    this.$("select").append("<option value='" + template.cid + "'>"
                    + template.label() + "</option>");
  }

  , addAll: function () {
    this.$("select").empty();

    _.each(this.collection.models, function (template) {
      this.addOne(template);
    }, this);
  }

  , switchTemplate: function () {
    var template = this.collection.getByCid(this.$("select").val());

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
});
