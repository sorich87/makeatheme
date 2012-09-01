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
    this.loadTemplate(this.collection.getTemplate("index"));

    return this;
  }

  , addOne: function (template) {
    this.$("select").append("<option value='" + template.cid + "'>"
                    + template.label() + "</option>");
  }

  , addAll: function () {
    _.each(this.collection.models, function (template) {
      this.addOne(template);
    }, this);
  }

  , switchTemplate: function (e) {
    this.loadTemplate(this.collection.getByCid(this.$("select").val()));
  }

  , loadTemplate: function (template) {
    $("body").empty().append(template.get("build"));
    app.trigger("templateLoaded", template.get("name"));
  }
});
