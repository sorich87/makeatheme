define([
  "jquery",
  "underscore",
  "backbone"
], function ($, _, Backbone) {

  var TemplateSelectView = Backbone.View.extend({
      el: $("<div id='x-templates-select'><h4><label>Current Template</label></h4>\
            <form><select></select></form></div>")

    , initialize: function (options) {
      this.bindEvents();
    }

    , render: function () {
      this.collection.reset(this.collection.models);

      return this;
    }

    , bindEvents: function () {
      this.collection.on("add", this.addOne, this);
      this.collection.on("reset", this.addAll, this);

      $(window.document).on("change", this.$el, $.proxy(this.switchTemplate, this));
    }

    , addOne: function (template) {
      var selected = "";

      if (template.get("current")) {
        // Load selected attribute
        selected = " selected='selected'";

        // Save current template
        this.currentTemplate = template;
      }

      this.$("select").append("<option value='" + template.cid + "'" + selected + ">"
                      + template.get("name") + "</option>");
    }

    , addAll: function () {
      this.$("select").empty();

      _.each(this.collection.models, function (template) {
        this.addOne(template);
      }, this);
    }

    , switchTemplate: function (e) {
      var modelCid = $(e.target).val()
        , template = this.collection.getByCid(modelCid);

      // Reset current template
      this.currentTemplate.set("current", false);
      template.set("current", true);

      // Load template file
      window.location.href = template.get("filename") + ".html";
    }
  });

  return TemplateSelectView;
});
